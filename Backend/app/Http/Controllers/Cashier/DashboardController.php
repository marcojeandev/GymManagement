<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\DashboardCacheService;

class DashboardController extends Controller
{
    protected $cacheService;

    public function __construct(DashboardCacheService $cacheService)
    {
        $this->cacheService = $cacheService;
    }

    public function index()
    {
        $data = $this->cacheService->getOverview();
        return response()->json(['status' => 1, 'data' => $data]);
    }

    public function salesTrend(Request $request)
    {
        $days = $request->input('days', 7);
        $data = $this->cacheService->getSalesTrend($days);
        return response()->json(['status' => 1, 'data' => $data]);
    }
}