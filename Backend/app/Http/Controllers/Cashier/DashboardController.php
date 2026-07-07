<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\DashboardCacheService;

class CashierDashboardController extends Controller
{
    protected $cacheService;

    public function __construct(DashboardCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index()
    {
        try {
            $data = $this->cacheService->getOverview();
            return response()->json([
                'status' => 1, 
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    public function salesTrend(Request $request)
    {
        try {
            $days = $request->input('days', 7);
            $data = $this->cacheService->getSalesTrend($days);
            return response()->json([
                'status' => 1, 
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to fetch sales trend: ' . $e->getMessage()
            ], 500);
        }
    }
}