<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\SalesRequest;
use App\Models\Sale;
use App\Models\ProductSold;
use App\Models\Product;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;

class SalesController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Sale::class);
        $query = Sale::with('productSold.product');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where('paid_by', 'LIKE', "%{$search}%")
                  ->orWhere('or_number', 'LIKE', "%{$search}%");
        }

        $sales = $query->latest()->paginate($request->per_page ?? 15);

        $sales->getCollection()->transform(function ($sale) {
            $sale->total = $sale->total;
            $sale->change = $sale->change;
            return $sale;
        });

        return response()->json([
            'status' => 1,
            'data' => $sales,
        ]);
    }

    public function show(Sale $sale)
    {
        $this->authorize('view', $sale);
        $sale->load('productSold.product');
        $sale->total = $sale->total;
        $sale->change = $sale->change;
        return response()->json([
            'status' => 1,
            'data' => $sale,
        ]);
    }

public function store(SalesRequest $request)
{
    $this->authorize('create', Sale::class);

    $validated = $request->validated();
    $products = $validated['products'];
    unset($validated['products']);

    // Compute total amount from the product list
    $totalAmount = array_sum(array_map(function ($item) {
        return $item['quantity'] * $item['price_at_sale'];
    }, $products));
    $validated['total_amount'] = $totalAmount;

    // If payment_amount is not provided, set null
    if (!isset($validated['payment_amount'])) {
        $validated['payment_amount'] = null;
    }

    DB::beginTransaction();
    try {
        $sale = Sale::create($validated);

        foreach ($products as $item) {
            ProductSold::create([
                'sales_id' => $sale->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price_at_sale' => $item['price_at_sale'],
            ]);

            $product = Product::find($item['product_id']);
            if ($product) {
                $product->quantity -= $item['quantity'];
                $product->sold += $item['quantity'];
                $product->save();
            }
        }

        DB::commit();
        return response()->json([
            'status' => 1,
            'message' => 'Sale created successfully.',
            'data' => $sale->load('productSold.product'),
        ], 201);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status' => 0,
            'message' => 'Creation failed: ' . $e->getMessage(),
        ], 500);
    }
}

    public function update(SalesRequest $request, Sale $sale)
    {
        $this->authorize('update', $sale);

        $validated = $request->validated();
        $products = $validated['products'] ?? [];
        unset($validated['products']);

        // Compute total amount from the product list
        $totalAmount = array_sum(array_map(function ($item) {
            return $item['quantity'] * $item['price_at_sale'];
        }, $products));
        $validated['total_amount'] = $totalAmount;

        if (!isset($validated['payment_amount'])) {
            $validated['payment_amount'] = null;
        }

        DB::beginTransaction();
        try {
            // 1. Restore old stock quantities from existing product_sold
            $oldItems = $sale->productSold;
            foreach ($oldItems as $oldItem) {
                $product = Product::find($oldItem->product_id);
                if ($product) {
                    $product->quantity += $oldItem->quantity;
                    $product->sold -= $oldItem->quantity;
                    $product->save();
                }
            }

            // 2. Delete old product_sold records
            $sale->productSold()->delete();

            // 3. Update sale details
            $sale->update($validated);

            // 4. Attach new products and apply new stock adjustments
            foreach ($products as $item) {
                ProductSold::create([
                    'sales_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price_at_sale' => $item['price_at_sale'],
                ]);

                $product = Product::find($item['product_id']);
                if ($product) {
                    $product->quantity -= $item['quantity'];
                    $product->sold += $item['quantity'];
                    $product->save();
                }
            }

            DB::commit();
            return response()->json([
                'status' => 1,
                'message' => 'Sale updated successfully.',
                'data' => $sale->load('productSold.product'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Update failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Sale $sale)
    {
        $this->authorize('delete', $sale);

        DB::beginTransaction();
        try {
            // Restore stock quantities before deleting
            $items = $sale->productSold;
            foreach ($items as $item) {
                $product = Product::find($item->product_id);
                if ($product) {
                    $product->quantity += $item->quantity;
                    $product->sold -= $item->quantity;
                    $product->save();
                }
            }

            // Delete product_sold and sale
            $sale->productSold()->delete();
            $sale->delete();

            DB::commit();
            return response()->json([
                'status' => 1,
                'message' => 'Sale deleted successfully.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 0,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}