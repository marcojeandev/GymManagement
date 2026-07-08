<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\Member;
use App\Models\Contract;
use App\Models\Sale;
use App\Models\Attendance;
use App\Models\WalkinAttendance;
use App\Models\WalkinInfo;
use App\Models\Product;
use App\Models\MembershipFee;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsCacheService
{
    protected $ttl = 600; // 10 minutes

    /**
     * Get overview statistics with caching
     */
    public function getOverview()
    {
        return Cache::remember('reports_overview', $this->ttl, function () {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();
            $thisYear = Carbon::now()->startOfYear();

            // Calculate all revenue in one query each
            $salesRevenue = Sale::where('created_at', '>=', $thisMonth)->sum('payment_amount');
            $contractRevenue = Contract::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');
            $membershipRevenue = MembershipFee::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');

            $salesToday = Sale::whereDate('created_at', $today)->sum('payment_amount');
            $contractToday = Contract::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');
            $membershipToday = MembershipFee::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');

            // Get counts efficiently
            $memberCounts = Member::selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN membership_status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN membership_status = 'expired' THEN 1 ELSE 0 END) as expired
            ")->first();

            $activeContracts = Contract::where('contract_to', '>=', $today)->count();

            $attendanceCounts = Attendance::selectRaw("
                SUM(CASE WHEN DATE(time_in) = ? THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN time_in >= ? THEN 1 ELSE 0 END) as this_month
            ", [$today, $thisMonth])->first();

            $walkinCounts = WalkinInfo::selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as today,
                SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) as this_month
            ", [$today, $thisMonth])->first();

            $walkinAttendanceToday = WalkinAttendance::whereDate('time_in', $today)->count();
            $walkinAttendanceMonth = WalkinAttendance::where('time_in', '>=', $thisMonth)->count();

            return [
                'members' => [
                    'total' => (int) ($memberCounts->total ?? 0),
                    'active' => (int) ($memberCounts->active ?? 0),
                    'expired' => (int) ($memberCounts->expired ?? 0),
                ],
                'contracts' => [
                    'active' => (int) $activeContracts,
                ],
                'sales' => [
                    'today' => (float) ($salesToday + $contractToday + $membershipToday),
                    'this_month' => (float) ($salesRevenue + $contractRevenue + $membershipRevenue),
                    'this_year' => (float) Sale::where('created_at', '>=', $thisYear)->sum('payment_amount'),
                    'breakdown' => [
                        'sales' => (float) $salesRevenue,
                        'contracts' => (float) $contractRevenue,
                        'membership_fees' => (float) $membershipRevenue,
                    ],
                ],
                'attendance' => [
                    'today' => (int) ($attendanceCounts->today ?? 0),
                    'this_month' => (int) ($attendanceCounts->this_month ?? 0),
                ],
                'walkins' => [
                    'total' => (int) ($walkinCounts->total ?? 0),
                    'today' => (int) $walkinAttendanceToday,
                    'this_month' => (int) $walkinAttendanceMonth,
                ],
            ];
        });
    }

    /**
     * Get member growth with caching
     */
    public function getMemberGrowth($months = 12)
    {
        $cacheKey = "reports_member_growth_{$months}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($months) {
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
                $values[] = (int) $item->count;
            }

            return ['labels' => $labels, 'values' => $values];
        });
    }

    /**
     * Get sales trend with caching
     */
    public function getSalesTrend($days = 30)
    {
        $cacheKey = "reports_sales_trend_{$days}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($days) {
            $startDate = Carbon::now()->subDays($days)->startOfDay();

            // Use UNION to get all data in one query
            $salesData = Sale::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(payment_amount), 0) as total'),
                DB::raw("'sale' as type")
            )
            ->whereDate('created_at', '>=', $startDate)
            ->groupBy('date')
            ->get()
            ->keyBy('date');

            $contractData = Contract::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(payment_amount), 0) as total'),
                DB::raw("'contract' as type")
            )
            ->whereDate('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

            $membershipData = MembershipFee::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(payment_amount), 0) as total'),
                DB::raw("'membership' as type")
            )
            ->whereDate('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

            $labels = [];
            $salesValues = [];
            $contractValues = [];
            $membershipValues = [];
            $totalValues = [];

            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();
                $labels[] = Carbon::parse($date)->format('M d');
                
                $sales = (float) ($salesData[$date]->total ?? 0);
                $contracts = (float) ($contractData[$date]->total ?? 0);
                $memberships = (float) ($membershipData[$date]->total ?? 0);
                
                $salesValues[] = $sales;
                $contractValues[] = $contracts;
                $membershipValues[] = $memberships;
                $totalValues[] = $sales + $contracts + $memberships;
            }

            return [
                'labels' => $labels,
                'sales' => $salesValues,
                'contracts' => $contractValues,
                'membership_fees' => $membershipValues,
                'total' => $totalValues,
            ];
        });
    }

    /**
     * Get top products with caching
     */
    public function getTopProducts($limit = 5)
    {
        $cacheKey = "reports_top_products_{$limit}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($limit) {
            return DB::table('product_sold')
                ->join('products', 'product_sold.product_id', '=', 'products.id')
                ->select(
                    'products.name',
                    DB::raw('SUM(product_sold.quantity) as total_quantity'),
                    DB::raw('COALESCE(SUM(product_sold.quantity * product_sold.price_at_sale), 0) as total_revenue')
                )
                ->groupBy('product_sold.product_id', 'products.name')
                ->orderBy('total_quantity', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'name' => $item->name,
                        'total_quantity' => (int) $item->total_quantity,
                        'total_revenue' => (float) $item->total_revenue,
                    ];
                });
        });
    }

    /**
     * Get attendance trend with caching
     */
    public function getAttendanceTrend($days = 30)
    {
        $cacheKey = "reports_attendance_trend_{$days}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($days) {
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

            return ['labels' => $labels, 'values' => $values];
        });
    }

    /**
     * Get sales by payment type with caching
     */
    public function getSalesByPaymentType()
    {
        return Cache::remember('reports_sales_by_payment', $this->ttl, function () {
            // Get sales payment types
            $sales = Sale::select(
                'payment_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(payment_amount), 0) as total')
            )
            ->groupBy('payment_type')
            ->get()
            ->keyBy('payment_type');

            // Get contract payment types
            $contracts = Contract::select(
                'payment_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(payment_amount), 0) as total')
            )
            ->where('payment_status', 'paid')
            ->groupBy('payment_type')
            ->get()
            ->keyBy('payment_type');

            // Get membership fee payment types
            $memberships = MembershipFee::select(
                'payment_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(payment_amount), 0) as total')
            )
            ->where('payment_status', 'paid')
            ->groupBy('payment_type')
            ->get()
            ->keyBy('payment_type');

            $default = [
                ['payment_type' => 'cash', 'count' => 0, 'total' => 0],
                ['payment_type' => 'gcash', 'count' => 0, 'total' => 0],
            ];

            $result = [];
            foreach ($default as $row) {
                $type = $row['payment_type'];
                $saleData = $sales[$type] ?? null;
                $contractData = $contracts[$type] ?? null;
                $membershipData = $memberships[$type] ?? null;

                $result[] = [
                    'payment_type' => $type,
                    'count' => ($saleData->count ?? 0) + ($contractData->count ?? 0) + ($membershipData->count ?? 0),
                    'total' => (float) (($saleData->total ?? 0) + ($contractData->total ?? 0) + ($membershipData->total ?? 0)),
                ];
            }

            return $result;
        });
    }

    /**
     * Get membership distribution with caching
     */
    public function getMembershipDistribution()
    {
        return Cache::remember('reports_membership_distribution', $this->ttl, function () {
            return Member::select('membership_status', DB::raw('COUNT(*) as count'))
                ->groupBy('membership_status')
                ->get()
                ->map(function ($item) {
                    return [
                        'membership_status' => $item->membership_status,
                        'count' => (int) $item->count,
                    ];
                });
        });
    }

    /**
     * Get contract distribution with caching
     */
    public function getContractDistribution()
    {
        return Cache::remember('reports_contract_distribution', $this->ttl, function () {
            $today = Carbon::today();
            $active = Contract::where('contract_to', '>=', $today)->count();
            $expired = Contract::where('contract_to', '<', $today)->count();

            return [
                ['status' => 'active', 'count' => (int) $active],
                ['status' => 'expired', 'count' => (int) $expired],
            ];
        });
    }

    /**
     * Get attendance distribution with caching
     */
    public function getAttendanceDistribution($start, $end)
    {
        $cacheKey = "reports_attendance_distribution_{$start}_{$end}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($start, $end) {
            $memberAttendances = Attendance::whereDate('time_in', '>=', $start)
                ->whereDate('time_in', '<=', $end)
                ->count();

            $walkinAttendances = WalkinAttendance::whereDate('time_in', '>=', $start)
                ->whereDate('time_in', '<=', $end)
                ->count();

            return [
                ['type' => 'Members', 'count' => (int) $memberAttendances],
                ['type' => 'Walk-ins', 'count' => (int) $walkinAttendances],
            ];
        });
    }

    /**
     * Get revenue breakdown with caching
     */
    public function getRevenueBreakdown($start, $end)
    {
        $cacheKey = "reports_revenue_breakdown_{$start}_{$end}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($start, $end) {
            $salesRevenue = Sale::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->sum('payment_amount');

            $contractRevenue = Contract::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');

            $membershipRevenue = MembershipFee::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');

            $totalRevenue = $salesRevenue + $contractRevenue + $membershipRevenue;

            return [
                'total_revenue' => (float) $totalRevenue,
                'breakdown' => [
                    'sales' => (float) $salesRevenue,
                    'contracts' => (float) $contractRevenue,
                    'membership_fees' => (float) $membershipRevenue,
                ],
                'period' => ['start' => $start, 'end' => $end],
            ];
        });
    }

    /**
     * Get all revenue sources combined with caching
     */
    public function getAllRevenue($start, $end)
    {
        $cacheKey = "reports_all_revenue_{$start}_{$end}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($start, $end) {
            $salesRevenue = Sale::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->sum('payment_amount');

            $contractRevenue = Contract::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');

            $membershipRevenue = MembershipFee::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('payment_amount');

            return [
                'sales' => (float) $salesRevenue,
                'contracts' => (float) $contractRevenue,
                'membership_fees' => (float) $membershipRevenue,
                'total' => (float) ($salesRevenue + $contractRevenue + $membershipRevenue),
                'period' => ['start' => $start, 'end' => $end],
            ];
        });
    }

    /**
     * Clear all report caches
     */
    public function clearCache()
    {
        Cache::forget('reports_overview');
        Cache::forget('reports_sales_by_payment');
        Cache::forget('reports_membership_distribution');
        Cache::forget('reports_contract_distribution');
        Cache::forget('reports_top_products_5');
        Cache::forget('reports_top_products_10');
        
        // Clear pattern-based caches
        $keys = [
            'reports_member_growth_',
            'reports_sales_trend_',
            'reports_attendance_trend_',
            'reports_attendance_distribution_',
            'reports_revenue_breakdown_',
            'reports_all_revenue_',
        ];
        
        foreach ($keys as $pattern) {
            Cache::forget($pattern);
        }
        
        return true;
    }
}