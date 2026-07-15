<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MembershipPrice;
use App\Models\ContractPrice;
use App\Models\GymSetting;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    public function getMembershipPrice()
    {
        try {
            $membershipPrice = MembershipPrice::first();

            return response()->json([
                'status' => 1,
                'data' => $membershipPrice
            ]);
        } catch (\Throwable $e) {
            Log::error('MembershipPrice error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getGymSettings()
    {
        try {
            $gymSetting = GymSetting::first();

            return response()->json([
                'status' => 1,
                'data' => $gymSetting
            ]);
        } catch (\Throwable $e) {
            Log::error('GymSettings error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    public function getContractPrices()
    {
        try {
            $prices = ContractPrice::all();
            
            return response()->json([
                'status' => 1,
                'data' => $prices,
            ]);
        } catch (\Throwable $e) {
            Log::error('ContractPrices error: ' . $e->getMessage());
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }
}