<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

class CashierDashboardCacheService
{
    public function getOverview()
    {
        try {
            return Cache::remember('cashier_dashboard_overview', 300, function () {
                $data = [];

                // Today's Sales
                if (Schema::hasTable('sales')) {
                    $data['total_sales'] = (float) (DB::table('sales')
                        ->whereDate('created_at', today())
                        ->sum('payment_amount') ?? 0);
                    
                    $data['monthly_sales'] = (float) (DB::table('sales')
                        ->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year)
                        ->sum('payment_amount') ?? 0);
                    
                    $data['total_sales_all_time'] = (float) (DB::table('sales')
                        ->sum('payment_amount') ?? 0);

                    // Recent Sales
                    $recentSales = DB::table('sales')
                        ->orderBy('created_at', 'desc')
                        ->limit(5)
                        ->get();

                    $data['recent_sales'] = [];
                    foreach ($recentSales as $sale) {
                        $data['recent_sales'][] = [
                            'id' => $sale->id,
                            'paid_by' => $sale->paid_by ?? 'N/A',
                            'amount' => (float) $sale->payment_amount,
                            'or_number' => $sale->or_number ?? 'N/A',
                            'payment_type' => $sale->payment_type ?? 'cash',
                            'created_at' => $sale->created_at ? $sale->created_at->diffForHumans() : 'N/A'
                        ];
                    }
                } else {
                    $data['total_sales'] = 0;
                    $data['monthly_sales'] = 0;
                    $data['total_sales_all_time'] = 0;
                    $data['recent_sales'] = [];
                }

                // Total Members
                if (Schema::hasTable('members')) {
                    $data['total_members'] = (int) DB::table('members')->count();

                    // Recent Members
                    $recentMembers = DB::table('members')
                        ->orderBy('created_at', 'desc')
                        ->limit(5)
                        ->get();

                    $data['recent_members'] = [];
                    foreach ($recentMembers as $member) {
                        $fullName = $member->firstname;
                        if ($member->middlename) {
                            $fullName .= ' ' . $member->middlename;
                        }
                        $fullName .= ' ' . $member->lastname;
                        if ($member->suffix) {
                            $fullName .= ' ' . $member->suffix;
                        }

                        $data['recent_members'][] = [
                            'id' => $member->id,
                            'name' => $fullName,
                            'email' => $member->email ?? 'N/A',
                            'status' => $member->membership_status ?? 'pending',
                            'created_at' => $member->created_at ? $member->created_at->diffForHumans() : 'N/A'
                        ];
                    }
                } else {
                    $data['total_members'] = 0;
                    $data['recent_members'] = [];
                }

                // Today's Attendance
                if (Schema::hasTable('attendance')) {
                    $data['today_attendance'] = (int) DB::table('attendance')
                        ->whereDate('created_at', today())
                        ->count();
                } else {
                    $data['today_attendance'] = 0;
                }

                // Today's Walk-ins
                if (Schema::hasTable('walk_in_attendance')) {
                    $data['today_walkins'] = (int) DB::table('walk_in_attendance')
                        ->whereDate('created_at', today())
                        ->count();
                } else {
                    $data['today_walkins'] = 0;
                }

                // Products
                if (Schema::hasTable('products')) {
                    $data['total_products'] = (int) DB::table('products')->count();
                } else {
                    $data['total_products'] = 0;
                }

                // Active Contracts
                if (Schema::hasTable('contract')) {
                    $data['active_contracts'] = (int) DB::table('contract')
                        ->where('payment_status', 'paid')
                        ->whereDate('contract_to', '>=', today())
                        ->count();

                    $data['expiring_soon'] = (int) DB::table('contract')
                        ->where('payment_status', 'paid')
                        ->whereDate('contract_to', '>=', today())
                        ->whereDate('contract_to', '<=', today()->addDays(7))
                        ->count();
                } else {
                    $data['active_contracts'] = 0;
                    $data['expiring_soon'] = 0;
                }

                // Sales Trend
                $data['sales_trend'] = $this->getSalesTrend(7);
                
                // Attendance Trend
                $data['attendance_trend'] = $this->getAttendanceTrend(7);

                return $data;
            });
        } catch (\Exception $e) {
            Log::error('DashboardCacheService error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Return default data on error
            return [
                'total_sales' => 0,
                'total_members' => 0,
                'today_attendance' => 0,
                'today_walkins' => 0,
                'total_products' => 0,
                'active_contracts' => 0,
                'expiring_soon' => 0,
                'monthly_sales' => 0,
                'total_sales_all_time' => 0,
                'recent_sales' => [],
                'recent_members' => [],
                'sales_trend' => ['labels' => [], 'values' => [], 'total' => 0],
                'attendance_trend' => ['labels' => [], 'values' => []],
            ];
        }
    }

    public function getSalesTrend($days = 7)
    {
        try {
            if (!Schema::hasTable('sales')) {
                return ['labels' => [], 'values' => [], 'total' => 0];
            }

            $sales = DB::table('sales')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('SUM(payment_amount) as total')
                )
                ->where('created_at', '>=', now()->subDays($days - 1))
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get();

            $labels = [];
            $values = [];
            $total = 0;
            
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i)->format('Y-m-d');
                $labels[] = date('M d', strtotime($date));
                
                $sale = $sales->firstWhere('date', $date);
                $amount = $sale ? (float) $sale->total : 0;
                $values[] = $amount;
                $total += $amount;
            }

            return [
                'labels' => $labels,
                'values' => $values,
                'total' => $total
            ];
        } catch (\Exception $e) {
            Log::error('Sales trend error: ' . $e->getMessage());
            return ['labels' => [], 'values' => [], 'total' => 0];
        }
    }

    public function getAttendanceTrend($days = 7)
    {
        try {
            if (!Schema::hasTable('attendance')) {
                return ['labels' => [], 'values' => []];
            }

            $attendance = DB::table('attendance')
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', now()->subDays($days - 1))
                ->groupBy('date')
                ->orderBy('date', 'ASC')
                ->get();

            $labels = [];
            $values = [];
            
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = now()->subDays($i)->format('Y-m-d');
                $labels[] = date('M d', strtotime($date));
                
                $att = $attendance->firstWhere('date', $date);
                $values[] = $att ? (int) $att->total : 0;
            }

            return [
                'labels' => $labels,
                'values' => $values
            ];
        } catch (\Exception $e) {
            Log::error('Attendance trend error: ' . $e->getMessage());
            return ['labels' => [], 'values' => []];
        }
    }
}