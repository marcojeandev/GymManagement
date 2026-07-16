<?php
namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\Member;
use App\Models\Contract;
use App\Models\Sale;
use App\Models\Attendance;
use App\Models\WalkinAttendance;
use App\Models\WalkinInfo;
use App\Models\MembershipFee;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportsCacheService
{
    protected $ttl = 60; // 1 minute for testing

    public function getOverview()
    {
        return Cache::remember('reports_overview', $this->ttl, function () {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();
            $thisYear = Carbon::now()->startOfYear();

            // Changed to total_amount
            $salesRevenue = Sale::where('created_at', '>=', $thisMonth)->sum('total_amount');
            $contractRevenue = Contract::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('total_amount');
            $membershipRevenue = MembershipFee::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            // Changed to total_amount
            $salesToday = Sale::whereDate('created_at', $today)->sum('total_amount');
            $contractToday = Contract::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total_amount');
            $membershipToday = MembershipFee::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            return [
                'members' => [
                    'total' => Member::count(),
                    'active' => Member::where('membership_status', 'active')->count(),
                    'expired' => Member::where('membership_status', 'expired')->count(),
                ],
                'contracts' => [
                    'active' => Contract::where('contract_to', '>=', $today)->count(),
                ],
                'sales' => [
                    'today' => (float) ($salesToday + $contractToday + $membershipToday),
                    'this_month' => (float) ($salesRevenue + $contractRevenue + $membershipRevenue),
                    'this_year' => (float) Sale::where('created_at', '>=', $thisYear)->sum('total_amount'), // Changed
                    'breakdown' => [
                        'sales' => (float) $salesRevenue,
                        'contracts' => (float) $contractRevenue,
                        'membership_fees' => (float) $membershipRevenue,
                    ],
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
            ];
        });
    }

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
            
            // Fill all months with zero if no data
            for ($i = $months - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $monthKey = $date->format('Y-m');
                $label = $date->format('M Y');
                
                $found = false;
                foreach ($data as $item) {
                    $itemDate = Carbon::createFromDate($item->year, $item->month, 1);
                    if ($itemDate->format('Y-m') === $monthKey) {
                        $labels[] = $label;
                        $values[] = (int) $item->count;
                        $found = true;
                        break;
                    }
                }
                
                if (!$found) {
                    $labels[] = $label;
                    $values[] = 0;
                }
            }

            return ['labels' => $labels, 'values' => $values];
        });
    }

    public function getSalesTrend($days = 30)
    {
        $cacheKey = "reports_sales_trend_{$days}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($days) {
            $startDate = Carbon::now()->subDays($days)->startOfDay();

            // Changed to total_amount
            $salesData = Sale::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(total_amount), 0) as total')
            )
            ->whereDate('created_at', '>=', $startDate)
            ->groupBy('date')
            ->get()
            ->keyBy('date');

            // Changed to total_amount
            $contractData = Contract::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(total_amount), 0) as total')
            )
            ->whereDate('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

            // Changed to total_amount
            $membershipData = MembershipFee::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COALESCE(SUM(total_amount), 0) as total')
            )
            ->whereDate('created_at', '>=', $startDate)
            ->where('payment_status', 'paid')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

            $labels = [];
            $values = [];

            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();
                $labels[] = Carbon::parse($date)->format('M d');
                
                $sales = (float) ($salesData[$date]->total ?? 0);
                $contracts = (float) ($contractData[$date]->total ?? 0);
                $memberships = (float) ($membershipData[$date]->total ?? 0);
                
                $values[] = $sales + $contracts + $memberships;
            }

            return [
                'labels' => $labels,
                'values' => $values,
            ];
        });
    }

    public function getTopProducts($limit = 5)
    {
        $cacheKey = "reports_top_products_{$limit}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($limit) {
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

            // Return as array of objects with proper keys
            return $products->map(function ($item) {
                return [
                    'name' => $item->name,
                    'total_quantity' => (int) $item->total_quantity,
                    'total_revenue' => (float) $item->total_revenue,
                ];
            })->toArray();
        });
    }

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

    public function getSalesByPaymentType()
    {
        return Cache::remember('reports_sales_by_payment', $this->ttl, function () {
            // Changed to total_amount
            $sales = Sale::select(
                'payment_type',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(total_amount), 0) as total')
            )
            ->groupBy('payment_type')
            ->get();

            // Ensure both cash and gcash are always present
            $result = [];
            $paymentTypes = ['cash', 'gcash'];
            
            foreach ($paymentTypes as $type) {
                $found = $sales->firstWhere('payment_type', $type);
                $result[] = [
                    'payment_type' => $type,
                    'count' => $found ? (int) $found->count : 0,
                    'total' => $found ? (float) $found->total : 0,
                ];
            }

            return $result;
        });
    }

    public function getMembershipDistribution()
    {
        return Cache::remember('reports_membership_distribution', $this->ttl, function () {
            $data = Member::select('membership_status', DB::raw('COUNT(*) as count'))
                ->groupBy('membership_status')
                ->get();

            // Ensure all statuses are present
            $statuses = ['active', 'expired', 'pending'];
            $result = [];
            
            foreach ($statuses as $status) {
                $found = $data->firstWhere('membership_status', $status);
                $result[] = [
                    'membership_status' => $status,
                    'count' => $found ? (int) $found->count : 0,
                ];
            }

            return $result;
        });
    }

    public function getContractDistribution()
    {
        return Cache::remember('reports_contract_distribution', $this->ttl, function () {
            $today = Carbon::today();
            
            // Get all contracts with status
            $active = Contract::where('contract_to', '>=', $today)->count();
            $expired = Contract::where('contract_to', '<', $today)->count();

            return [
                ['status' => 'active', 'count' => (int) $active],
                ['status' => 'expired', 'count' => (int) $expired],
            ];
        });
    }

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

    public function getRevenueBreakdown($start, $end)
    {
        $cacheKey = "reports_revenue_breakdown_{$start}_{$end}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($start, $end) {
            // Changed to total_amount
            $salesRevenue = Sale::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->sum('total_amount');

            // Changed to total_amount
            $contractRevenue = Contract::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            // Changed to total_amount
            $membershipRevenue = MembershipFee::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            return [
                'total_revenue' => (float) ($salesRevenue + $contractRevenue + $membershipRevenue),
                'breakdown' => [
                    'sales' => (float) $salesRevenue,
                    'contracts' => (float) $contractRevenue,
                    'membership_fees' => (float) $membershipRevenue,
                ],
                'period' => ['start' => $start, 'end' => $end],
            ];
        });
    }

    public function getAllRevenue($start, $end)
    {
        $cacheKey = "reports_all_revenue_{$start}_{$end}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($start, $end) {
            // Changed to total_amount
            $salesRevenue = Sale::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->sum('total_amount');

            // Changed to total_amount
            $contractRevenue = Contract::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            // Changed to total_amount
            $membershipRevenue = MembershipFee::whereDate('created_at', '>=', $start)
                ->whereDate('created_at', '<=', $end)
                ->where('payment_status', 'paid')
                ->sum('total_amount');

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