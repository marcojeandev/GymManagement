<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB; 
use App\Models\Member;
use App\Models\Contract;
use App\Models\Sale;
use App\Models\Attendance;
use App\Models\WalkinAttendance;
use App\Models\MembershipFee;
use Carbon\Carbon;

class DashboardCacheService
{
    protected $ttl = 300; // 5 minutes

    public function getOverview()
    {
        return Cache::remember('dashboard_overview', $this->ttl, function () {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();

            // Sales - changed to total_amount
            $salesToday = (float) Sale::whereDate('created_at', $today)->sum('total_amount');
            $salesThisMonth = (float) Sale::where('created_at', '>=', $thisMonth)->sum('total_amount');
            $salesLastWeek = (float) Sale::where('created_at', '>=', Carbon::now()->subDays(7))->sum('total_amount');

            // Contracts - changed to total_amount
            $contractToday = (float) Contract::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total_amount');
            $contractThisMonth = (float) Contract::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('total_amount');
            $contractLastWeek = (float) Contract::where('created_at', '>=', Carbon::now()->subDays(7))
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            // Membership Fees - changed to total_amount
            $membershipToday = (float) MembershipFee::whereDate('created_at', $today)
                ->where('payment_status', 'paid')
                ->sum('total_amount');
            $membershipThisMonth = (float) MembershipFee::where('created_at', '>=', $thisMonth)
                ->where('payment_status', 'paid')
                ->sum('total_amount');
            $membershipLastWeek = (float) MembershipFee::where('created_at', '>=', Carbon::now()->subDays(7))
                ->where('payment_status', 'paid')
                ->sum('total_amount');

            // WALK-IN REVENUE - no change (using fee_paid)
            $walkinToday = (float) WalkinAttendance::whereDate('time_in', $today)->sum('fee_paid');
            $walkinThisMonth = (float) WalkinAttendance::where('time_in', '>=', $thisMonth)->sum('fee_paid');
            $walkinLastWeek = (float) WalkinAttendance::where('time_in', '>=', Carbon::now()->subDays(7))->sum('fee_paid');

            return [
                'members' => [
                    'total' => Member::count(),
                    'active' => Member::where('membership_status', 'active')->count(),
                    'new_this_month' => Member::where('created_at', '>=', $thisMonth)->count(),
                ],
                'contracts' => [
                    'active' => Contract::where('contract_to', '>=', $today)->count(),
                    'expiring_soon' => Contract::whereBetween('contract_to', [$today, $today->copy()->addDays(7)])->count(),
                    'revenue_today' => $contractToday,
                    'revenue_this_month' => $contractThisMonth,
                    'revenue_last_week' => $contractLastWeek,
                ],
                'membership_fees' => [
                    'revenue_today' => $membershipToday,
                    'revenue_this_month' => $membershipThisMonth,
                    'revenue_last_week' => $membershipLastWeek,
                ],
                'sales' => [
                    'today' => $salesToday,
                    'this_month' => $salesThisMonth,
                    'last_week' => $salesLastWeek,
                    'total_today' => $salesToday + $contractToday + $membershipToday + $walkinToday,
                    'total_this_month' => $salesThisMonth + $contractThisMonth + $membershipThisMonth + $walkinThisMonth,
                    'total_last_week' => $salesLastWeek + $contractLastWeek + $membershipLastWeek + $walkinLastWeek,
                ],
                'walkins' => [
                    'today' => WalkinAttendance::whereDate('time_in', $today)->count(),
                    'this_month' => WalkinAttendance::where('time_in', '>=', $thisMonth)->count(),
                    'revenue_today' => $walkinToday,
                    'revenue_this_month' => $walkinThisMonth,
                    'revenue_last_week' => $walkinLastWeek,
                ],
                'attendance' => [
                    'today' => Attendance::whereDate('time_in', $today)->count(),
                    'this_month' => Attendance::where('time_in', '>=', $thisMonth)->count(),
                ],
                'recent_sales' => Sale::latest()->limit(5)->get()->map(function ($sale) {
                    return [
                        'id' => $sale->id,
                        'paid_by' => $sale->paid_by,
                        'amount' => (float) $sale->total_amount, // Changed to total_amount
                        'or_number' => $sale->or_number,
                        'created_at' => $sale->created_at->diffForHumans(),
                    ];
                })->toArray(),
                'recent_contracts' => Contract::where('payment_status', 'paid')
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(function ($contract) {
                        return [
                            'id' => $contract->id,
                            'member_name' => $contract->member->firstname . ' ' . $contract->member->lastname ?? 'N/A',
                            'amount' => (float) $contract->total_amount, // Changed to total_amount
                            'or_number' => $contract->or_number ?? 'N/A',
                            'created_at' => $contract->created_at->diffForHumans(),
                        ];
                    })->toArray(),
            ];
        });
    }

    public function getSalesTrend($days = 7)
    {
        $cacheKey = "sales_trend_{$days}";
        Cache::forget($cacheKey);
        
        return Cache::remember($cacheKey, $this->ttl, function () use ($days) {
            $startDate = Carbon::now()->subDays($days - 1)->startOfDay();
            
            // Changed to total_amount
            $salesData = DB::table('sales')
                ->where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as total')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->keyBy('date');

            // Changed to total_amount
            $contractData = DB::table('contract')
                ->where('created_at', '>=', $startDate)
                ->where('payment_status', 'paid')
                ->selectRaw('DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as total')
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->keyBy('date');

            // Changed to total_amount
            $membershipData = DB::table('membership_fee')
                ->where('created_at', '>=', $startDate)
                ->where('payment_status', 'paid')
                ->selectRaw('DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as total')
                ->groupBy('date')
                ->orderBy('date', 'asc')
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
                'values' => $totalValues,
                'breakdown' => [
                    'sales' => $salesValues,
                    'contracts' => $contractValues,
                    'membership_fees' => $membershipValues,
                ],
            ];
        });
    }
}