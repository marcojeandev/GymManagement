<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Member;
use App\Models\Contract;
use App\Models\Sale;
use App\Models\Attendance;
use App\Models\WalkinAttendance;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastWeek = Carbon::now()->subDays(7);

        // Member stats
        $totalMembers = Member::count();
        $activeMembers = Member::where('membership_status', 'active')->count();
        $newMembersThisMonth = Member::where('created_at', '>=', $thisMonth)->count();

        // Contract stats
        $activeContracts = Contract::where('contract_to', '>=', $today)->count();
        $expiringSoon = Contract::whereBetween('contract_to', [$today, $today->copy()->addDays(7)])->count();

        // Sales stats
        $salesToday = Sale::whereDate('created_at', $today)->sum('payment_amount');
        $salesThisMonth = Sale::where('created_at', '>=', $thisMonth)->sum('payment_amount');
        $salesLastWeek = Sale::whereBetween('created_at', [$lastWeek, $today])->sum('payment_amount');

        // Attendance stats
        $attendanceToday = Attendance::whereDate('time_in', $today)->count();
        $attendanceThisMonth = Attendance::where('time_in', '>=', $thisMonth)->count();

        // Walk-in stats
        $walkinToday = WalkinAttendance::whereDate('time_in', $today)->count();
        $walkinThisMonth = WalkinAttendance::where('time_in', '>=', $thisMonth)->count();

        // Recent sales (for the activity feed)
        $recentSales = Sale::with('productSold.product')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'paid_by' => $sale->paid_by,
                    'amount' => $sale->payment_amount,
                    'or_number' => $sale->or_number,
                    'created_at' => $sale->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'status' => 1,
            'data' => [
                'members' => [
                    'total' => $totalMembers,
                    'active' => $activeMembers,
                    'new_this_month' => $newMembersThisMonth,
                ],
                'contracts' => [
                    'active' => $activeContracts,
                    'expiring_soon' => $expiringSoon,
                ],
                'sales' => [
                    'today' => (float) $salesToday,
                    'this_month' => (float) $salesThisMonth,
                    'last_week' => (float) $salesLastWeek,
                ],
                'attendance' => [
                    'today' => $attendanceToday,
                    'this_month' => $attendanceThisMonth,
                ],
                'walkins' => [
                    'today' => $walkinToday,
                    'this_month' => $walkinThisMonth,
                ],
                'recent_sales' => $recentSales,
            ],
        ]);
    }
}