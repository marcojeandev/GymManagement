<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\Contract;
use App\Models\Sale;
use App\Models\Attendance;
use App\Models\WalkinAttendance;
use App\Models\WalkinInfo;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Overview statistics
     */
    public function overview(Request $request)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        return response()->json([
            'status' => 1,
            'data' => [
                'members' => [
                    'total' => Member::count(),
                    'active' => Member::where('membership_status', 'active')->count(),
                    'expired' => Member::where('membership_status', 'expired')->count(),
                ],
                'contracts' => [
                    'active' => Contract::where('contract_to', '>=', $today)->count(),
                ],
                'sales' => [
                    'today' => (float) Sale::whereDate('created_at', $today)->sum('payment_amount'),
                    'this_month' => (float) Sale::where('created_at', '>=', $thisMonth)->sum('payment_amount'),
                    'this_year' => (float) Sale::where('created_at', '>=', $thisYear)->sum('payment_amount'),
                ],
                'attendance' => [
                    'today' => Attendance::whereDate('time_in', $today)->count(),
                    'this_month' => Attendance::where('time_in', '>=', $thisMonth)->count(),
                ],
                'walkins' => [
                    'total' => WalkinInfo::count(),
                    'today' => WalkinAttendance::whereDate('time_in', $today)->count(),
                    'this_month' => WalkinAttendance::where('time_in', '>=', $thisMonth)->count(),
                ],
            ],
        ]);
    }

    /**
     * Member growth (monthly)
     */
    public function memberGrowth(Request $request)
    {
        $months = $request->input('months', 12);
        $startDate = Carbon::now()->subMonths($months)->startOfMonth();

        $data = Member::select(
            DB::raw('YEAR(created_at) as year'),
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', $startDate)
        ->groupBy('year', 'month')
        ->orderBy('year', 'asc')
        ->orderBy('month', 'asc')
        ->get();

        $labels = [];
        $values = [];
        foreach ($data as $item) {
            $date = Carbon::createFromDate($item->year, $item->month, 1);
            $labels[] = $date->format('M Y');
            $values[] = $item->count;
        }

        return response()->json([
            'status' => 1,
            'data' => ['labels' => $labels, 'values' => $values],
        ]);
    }

    /**
     * Sales trend (daily)
     */
    public function salesTrend(Request $request)
    {
        $days = $request->input('days', 30);
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        $data = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COALESCE(SUM(payment_amount), 0) as total')
        )
        ->whereDate('created_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get()
        ->keyBy('date');

        $labels = [];
        $values = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $labels[] = Carbon::parse($date)->format('M d');
            $values[] = (float) ($data[$date]->total ?? 0);
        }

        return response()->json([
            'status' => 1,
            'data' => ['labels' => $labels, 'values' => $values],
        ]);
    }

    /**
     * Top selling products
     */
    public function topProducts(Request $request)
    {
        $limit = $request->input('limit', 5);

        $products = DB::table('product_sold')
            ->join('products', 'product_sold.product_id', '=', 'products.id')
            ->select(
                'products.name',
                DB::raw('SUM(product_sold.quantity) as total_quantity'),
                DB::raw('COALESCE(SUM(product_sold.quantity * product_sold.price_at_sale), 0) as total_revenue')
            )
            ->groupBy('product_sold.product_id', 'products.name')
            ->orderBy('total_quantity', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 1,
            'data' => $products,
        ]);
    }

    /**
     * Attendance trend (daily)
     */
    public function attendanceTrend(Request $request)
    {
        $days = $request->input('days', 30);
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        $data = Attendance::select(
            DB::raw('DATE(time_in) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('time_in', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get()
        ->keyBy('date');

        $labels = [];
        $values = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $labels[] = Carbon::parse($date)->format('M d');
            $values[] = (int) ($data[$date]->count ?? 0);
        }

        return response()->json([
            'status' => 1,
            'data' => ['labels' => $labels, 'values' => $values],
        ]);
    }

    /**
     * Sales by payment type
     */
    public function salesByPaymentType()
    {
        $result = Sale::select(
            'payment_type',
            DB::raw('COUNT(*) as count'),
            DB::raw('COALESCE(SUM(payment_amount), 0) as total')
        )
        ->groupBy('payment_type')
        ->get();

        $default = [
            ['payment_type' => 'cash', 'count' => 0, 'total' => 0],
            ['payment_type' => 'gcash', 'count' => 0, 'total' => 0],
        ];

        if ($result->isEmpty()) {
            return response()->json(['status' => 1, 'data' => $default]);
        }

        $map = $result->keyBy('payment_type')->map(function ($item) {
            return ['count' => $item->count, 'total' => (float) $item->total];
        })->toArray();

        $merged = [];
        foreach ($default as $row) {
            $type = $row['payment_type'];
            $merged[] = [
                'payment_type' => $type,
                'count' => $map[$type]['count'] ?? 0,
                'total' => $map[$type]['total'] ?? 0,
            ];
        }

        return response()->json(['status' => 1, 'data' => $merged]);
    }

    /**
     * Membership status distribution
     */
    public function membershipStatusDistribution()
    {
        $data = Member::select('membership_status', DB::raw('COUNT(*) as count'))
            ->groupBy('membership_status')
            ->get();

        return response()->json(['status' => 1, 'data' => $data]);
    }

    /**
     * Contract status distribution
     */
    public function contractStatusDistribution()
    {
        $today = Carbon::today();
        $active = Contract::where('contract_to', '>=', $today)->count();
        $expired = Contract::where('contract_to', '<', $today)->count();

        return response()->json([
            'status' => 1,
            'data' => [
                ['status' => 'active', 'count' => $active],
                ['status' => 'expired', 'count' => $expired],
            ],
        ]);
    }

    /**
     * ✅ Attendance distribution (member vs walk-in) – FIXED
     */
    public function attendanceDistribution(Request $request)
    {
        $start = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
        $end = $request->input('end', Carbon::now()->toDateString());

        // Using whereDate to avoid timezone issues
        $memberAttendances = Attendance::whereDate('time_in', '>=', $start)
            ->whereDate('time_in', '<=', $end)
            ->count();

        $walkinAttendances = WalkinAttendance::whereDate('time_in', '>=', $start)
            ->whereDate('time_in', '<=', $end)
            ->count();

        return response()->json([
            'status' => 1,
            'data' => [
                ['type' => 'Members', 'count' => $memberAttendances],
                ['type' => 'Walk-ins', 'count' => $walkinAttendances],
            ],
        ]);
    }

    /**
     * ✅ Revenue breakdown – FIXED
     */
    public function revenueBreakdown(Request $request)
    {
        $start = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
        $end = $request->input('end', Carbon::now()->toDateString());

        $totalRevenue = Sale::whereDate('created_at', '>=', $start)
            ->whereDate('created_at', '<=', $end)
            ->sum('payment_amount');

        return response()->json([
            'status' => 1,
            'data' => [
                'total_revenue' => (float) $totalRevenue,
                'period' => ['start' => $start, 'end' => $end],
            ],
        ]);
    }
}