<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MembershipPrice;
use App\Models\ContractPrice;
use App\Models\GymSetting;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SettingsController extends Controller
{
    use AuthorizesRequests;

    public function getMembershipPrice()
    {
        try {
            $membershipPrice = MembershipPrice::first();
            $this->authorize('view', $membershipPrice ?? MembershipPrice::class);

            return response()->json([
                'status' => 1,
                'data' => $membershipPrice
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }


    public function getGymSettings()
    {
        try {
            $gymSetting = GymSetting::first();
            $this->authorize('view', $gymSetting ?? GymSetting::class);

            return response()->json([
                'status' => 1,
                'data' => $gymSetting
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    public function getContractPrices()
    {
        try {
            $this->authorize('viewAny', ContractPrice::class);
            $prices = ContractPrice::all();
            return response()->json([
                'status' => 1,
                'data' => $prices,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error: ' . $e->getMessage(),
            ], 500);
        }
    }
   
}