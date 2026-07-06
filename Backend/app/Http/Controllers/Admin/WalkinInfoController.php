<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\WalkinInfoRequest;
use App\Models\WalkinInfo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class WalkinInfoController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', WalkinInfo::class);

        $query = WalkinInfo::query();

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('firstname', 'LIKE', "%{$search}%")
                  ->orWhere('lastname', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('contact', 'LIKE', "%{$search}%");
            });
        }

        $walkins = $query->latest()->paginate($request->per_page ?? 15);

        return response()->json([
            'status' => 1,
            'data' => $walkins,
        ]);
    }

    public function show(WalkinInfo $walkinInfo)
    {
        $this->authorize('view', $walkinInfo);
        return response()->json([
            'status' => 1,
            'data' => $walkinInfo,
        ]);
    }

    public function store(WalkinInfoRequest $request)
    {
        $this->authorize('create', WalkinInfo::class);

        $validated = $request->validated();
        // Set default total_visits if not provided
        if (!isset($validated['total_visits'])) {
            $validated['total_visits'] = 1;
        }

        $walkin = WalkinInfo::create($validated);

        return response()->json([
            'status' => 1,
            'message' => 'Walk-in record created successfully.',
            'data' => $walkin,
        ], 201);
    }

    public function update(WalkinInfoRequest $request, WalkinInfo $walkinInfo)
    {
        $this->authorize('update', $walkinInfo);

        $validated = $request->validated();
        $walkinInfo->update($validated);

        return response()->json([
            'status' => 1,
            'message' => 'Walk-in record updated successfully.',
            'data' => $walkinInfo->fresh(),
        ]);
    }

    public function destroy(WalkinInfo $walkinInfo)
    {
        $this->authorize('delete', $walkinInfo);

        $walkinInfo->delete();

        return response()->json([
            'status' => 1,
            'message' => 'Walk-in record deleted successfully.',
        ]);
    }
}