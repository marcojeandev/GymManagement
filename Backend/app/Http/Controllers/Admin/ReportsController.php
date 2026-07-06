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
     * Dashboard overview statistics
     */
    public function overview(Request $request)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        $totalMembers = Member::count();
        $activeMembers = Member::where('membership_status', 'active')->count();
        $expiredMembers = Member::where('membership_status', 'expired')->count();

        $activeContracts = Contract::where('contract_to', '>=', $today)->count();

        $salesToday = Sale::whereDate('created_at', $today)->sum('payment_amount');
        $salesThisMonth = Sale::where('created_at', '>=', $thisMonth)->sum('payment_amount');
        $salesThisYear = Sale::where('created_at', '>=', $thisYear)->sum('payment_amount');

        $attendanceToday = Attendance::whereDate('time_in', $today)->count();
        $attendanceThisMonth = Attendance::where('time_in', '>=', $thisMonth)->count();

        $walkinToday = WalkinAttendance::whereDate('time_in', $today)->count();
        $walkinThisMonth = WalkinAttendance::where('time_in', '>=', $thisMonth)->count();

        $totalWalkins = WalkinInfo::count();

        return response()->json([
            'status' => 1,
            'data' => [
                'members' => [
                    'total' => $totalMembers,
                    'active' => $activeMembers,
                    'expired' => $expiredMembers,
                ],
                'contracts' => [
                    'active' => $activeContracts,
                ],
                'sales' => [
                    'today' => (float) $salesToday,
                    'this_month' => (float) $salesThisMonth,
                    'this_year' => (float) $salesThisYear,
                ],
                'attendance' => [
                    'today' => $attendanceToday,
                    'this_month' => $attendanceThisMonth,
                ],
                'walkins' => [
                    'total' => $totalWalkins,
                    'today' => $walkinToday,
                    'this_month' => $walkinThisMonth,
                ],
            ],
        ]);
    }

    /**
     * Member growth over time (monthly new members)
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
            'data' => [
                'labels' => $labels,
                'values' => $values,
            ],
        ]);
    }

    /**
     * Sales trend (daily sales for last N days) – FIXED
     */
    public function salesTrend(Request $request)
    {
        $days = $request->input('days', 30);
        $startDate = Carbon::now()->subDays($days)->startOfDay();

        // Get actual data from database
        $data = Sale::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COALESCE(SUM(payment_amount), 0) as total')
        )
        ->whereDate('created_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date', 'asc')
        ->get()
        ->keyBy('date');

        // Build array with all days in the range, fill missing with 0
        $allDates = collect();
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $allDates[$date] = 0;
        }

        foreach ($data as $date => $row) {
            $allDates[$date] = (float) $row->total;
        }

        // Build labels and values
        $labels = [];
        $values = [];
        foreach ($allDates as $date => $total) {
            $labels[] = Carbon::parse($date)->format('M d');
            $values[] = $total;
        }

        // Debug log (optional)
        \Log::info('SalesTrend result', ['labels' => $labels, 'values' => $values]);

        return response()->json([
            'status' => 1,
            'data' => [
                'labels' => $labels,
                'values' => $values,
            ],
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
     * Attendance trend (daily attendance for last N days)
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

        $allDates = collect();
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            $allDates[$date] = 0;
        }

        foreach ($data as $date => $row) {
            $allDates[$date] = $row->count;
        }

        $labels = [];
        $values = [];
        foreach ($allDates as $date => $count) {
            $labels[] = Carbon::parse($date)->format('M d');
            $values[] = $count;
        }

        return response()->json([
            'status' => 1,
            'data' => [
                'labels' => $labels,
                'values' => $values,
            ],
        ]);
    }

    /**
     * Sales by payment type – FIXED with fallback
     */
    public function salesByPaymentType(Request $request)
    {
        $data = Sale::select(
            'payment_type',
            DB::raw('COUNT(*) as count'),
            DB::raw('COALESCE(SUM(payment_amount), 0) as total')
        )
        ->groupBy('payment_type')
        ->get();

        // If no data, return a default placeholder to avoid frontend errors
        if ($data->isEmpty()) {
            return response()->json([
                'status' => 1,
                'data' => [
                    ['payment_type' => 'cash', 'count' => 0, 'total' => 0],
                    ['payment_type' => 'gcash', 'count' => 0, 'total' => 0],
                ],
            ]);
        }

        return response()->json([
            'status' => 1,
            'data' => $data,
        ]);
    }

    /**
     * Membership status distribution
     */
    public function membershipStatusDistribution()
    {
        $data = Member::select(
            'membership_status',
            DB::raw('COUNT(*) as count')
        )
        ->groupBy('membership_status')
        ->get();

        return response()->json([
            'status' => 1,
            'data' => $data,
        ]);
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
     * Attendance distribution (member vs walk-in)
     */
    public function attendanceDistribution(Request $request)
    {
        $start = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
        $end = $request->input('end', Carbon::now()->toDateString());

        $memberAttendances = Attendance::whereBetween('time_in', [$start, $end])->count();
        $walkinAttendances = WalkinAttendance::whereBetween('time_in', [$start, $end])->count();

        return response()->json([
            'status' => 1,
            'data' => [
                ['type' => 'Members', 'count' => $memberAttendances],
                ['type' => 'Walk-ins', 'count' => $walkinAttendances],
            ],
        ]);
    }

    /**
     * Revenue breakdown (total revenue from sales)
     */
    public function revenueBreakdown(Request $request)
    {
        $start = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
        $end = $request->input('end', Carbon::now()->toDateString());

        $totalRevenue = Sale::whereBetween('created_at', [$start, $end])->sum('payment_amount');

        return response()->json([
            'status' => 1,
            'data' => [
                'total_revenue' => (float) $totalRevenue,
                'period' => [
                    'start' => $start,
                    'end' => $end,
                ],
            ],
        ]);
    }
}