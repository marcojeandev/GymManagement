<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use App\Models\Member;
use App\Models\Contract;
use App\Models\Sale;
use App\Models\Attendance;
use App\Models\WalkinAttendance;
use Carbon\Carbon;

class DashboardCacheService
{
    protected $ttl = 300; // 5 minutes

    public function getOverview()
    {
        return Cache::remember('dashboard_overview', $this->ttl, function () {
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();

            return [
                'members' => [
                    'total' => Member::count(),
                    'active' => Member::where('membership_status', 'active')->count(),
                    'new_this_month' => Member::where('created_at', '>=', $thisMonth)->count(),
                ],
                'contracts' => [
                    'active' => Contract::where('contract_to', '>=', $today)->count(),
                    'expiring_soon' => Contract::whereBetween('contract_to', [$today, $today->copy()->addDays(7)])->count(),
                ],
                'sales' => [
                    'today' => (float) Sale::whereBetween('created_at', [$today, $today->copy()->endOfDay()])->sum('payment_amount'),
                    'this_month' => (float) Sale::where('created_at', '>=', $thisMonth)->sum('payment_amount'),
                    'last_week' => (float) Sale::whereBetween('created_at', [Carbon::now()->subDays(7), $today])->sum('payment_amount'),
                ],
                'attendance' => [
                    'today' => Attendance::whereBetween('time_in', [$today, $today->copy()->endOfDay()])->count(),
                    'this_month' => Attendance::where('time_in', '>=', $thisMonth)->count(),
                ],
                'walkins' => [
                    'today' => WalkinAttendance::whereBetween('time_in', [$today, $today->copy()->endOfDay()])->count(),
                    'this_month' => WalkinAttendance::where('time_in', '>=', $thisMonth)->count(),
                ],
                'recent_sales' => Sale::latest()->limit(5)->get()->map(function ($sale) {
                    return [
                        'id' => $sale->id,
                        'paid_by' => $sale->paid_by,
                        'amount' => (float) $sale->payment_amount,
                        'or_number' => $sale->or_number,
                        'created_at' => $sale->created_at->diffForHumans(),
                    ];
                })->toArray(), // ensure it's an array
            ];
        });
    }

    public function getSalesTrend($days = 7)
    {
        $cacheKey = "sales_trend_{$days}";
        return Cache::remember($cacheKey, $this->ttl, function () use ($days) {
            $startDate = Carbon::now()->subDays($days)->startOfDay();
            $data = Sale::selectRaw('DATE(created_at) as date, COALESCE(SUM(payment_amount), 0) as total')
                ->where('created_at', '>=', $startDate)
                ->groupBy('date')
                ->orderBy('date', 'asc')
                ->get()
                ->keyBy('date');

            // Fill missing days with 0
            $labels = [];
            $values = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i)->toDateString();
                $labels[] = Carbon::parse($date)->format('M d');
                $values[] = (float) ($data[$date]->total ?? 0);
            }

            return ['labels' => $labels, 'values' => $values];
        });
    }

    // Add similar methods for other report metrics...
}