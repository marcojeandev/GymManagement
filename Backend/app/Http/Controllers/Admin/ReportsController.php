<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ReportsCacheService;
use App\Http\Resources\ReportsResource;
use Carbon\Carbon;

class ReportsController extends Controller
{
    protected $cacheService;

    public function __construct(ReportsCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    /**
     * Overview statistics
     */
    public function overview(Request $request)
    {
        try {
            $data = $this->cacheService->getOverview();
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch overview: ' . $e->getMessage());
        }
    }

    /**
     * Member growth (monthly)
     */
    public function memberGrowth(Request $request)
    {
        try {
            $months = $request->input('months', 12);
            $data = $this->cacheService->getMemberGrowth($months);
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch member growth: ' . $e->getMessage());
        }
    }

    /**
     * Sales trend (daily) - INCLUDING CONTRACTS
     */
    public function salesTrend(Request $request)
    {
        try {
            $days = $request->input('days', 30);
            $data = $this->cacheService->getSalesTrend($days);
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch sales trend: ' . $e->getMessage());
        }
    }

    /**
     * Top selling products
     */
    public function topProducts(Request $request)
    {
        try {
            $limit = $request->input('limit', 5);
            $data = $this->cacheService->getTopProducts($limit);
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch top products: ' . $e->getMessage());
        }
    }

    /**
     * Attendance trend (daily)
     */
    public function attendanceTrend(Request $request)
    {
        try {
            $days = $request->input('days', 30);
            $data = $this->cacheService->getAttendanceTrend($days);
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch attendance trend: ' . $e->getMessage());
        }
    }

    /**
     * Sales by payment type - INCLUDING CONTRACTS
     */
    public function salesByPaymentType()
    {
        try {
            $data = $this->cacheService->getSalesByPaymentType();
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch sales by payment type: ' . $e->getMessage());
        }
    }

    /**
     * Membership status distribution
     */
    public function membershipStatusDistribution()
    {
        try {
            $data = $this->cacheService->getMembershipDistribution();
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch membership distribution: ' . $e->getMessage());
        }
    }

    /**
     * Contract status distribution
     */
    public function contractStatusDistribution()
    {
        try {
            $data = $this->cacheService->getContractDistribution();
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch contract distribution: ' . $e->getMessage());
        }
    }

    /**
     * Attendance distribution (member vs walk-in)
     */
    public function attendanceDistribution(Request $request)
    {
        try {
            $start = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
            $end = $request->input('end', Carbon::now()->toDateString());
            $data = $this->cacheService->getAttendanceDistribution($start, $end);
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch attendance distribution: ' . $e->getMessage());
        }
    }

    /**
     * Revenue breakdown - INCLUDING CONTRACTS
     */
    public function revenueBreakdown(Request $request)
    {
        try {
            $start = $request->input('start', Carbon::now()->startOfMonth()->toDateString());
            $end = $request->input('end', Carbon::now()->toDateString());
            $data = $this->cacheService->getRevenueBreakdown($start, $end);
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch revenue breakdown: ' . $e->getMessage());
        }
    }

    /**
     * Get all revenue sources combined
     */
    public function getAllRevenue(Request $request)
    {
        try {
            $start = $request->input('start', Carbon::now()->startOfYear()->toDateString());
            $end = $request->input('end', Carbon::now()->toDateString());
            $data = $this->cacheService->getAllRevenue($start, $end);
            return ReportsResource::success($data);
        } catch (\Exception $e) {
            return ReportsResource::error('Failed to fetch all revenue: ' . $e->getMessage());
        }
    }

    /**
     * Clear all report caches
     */
    public function clearCache()
    {
        try {
            $this->cacheService->clearCache();
            return response()->json([
                'status' => 1,
                'message' => 'Report caches cleared successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to clear caches: ' . $e->getMessage(),
            ], 500);
        }
    }
}