<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MembershipPrice;
use App\Models\ContractPrice;
use App\Models\GymSetting;
use App\Http\Requests\Admin\MembershipPriceRequest;
use App\Http\Requests\Admin\ContractPriceRequest;
use App\Http\Requests\Admin\SystemSettingRequest;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SettingsController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        try {
            $membershipPrice = MembershipPrice::first();
            $contractPrice = ContractPrice::first();
            $gymSetting = GymSetting::first();

            $this->authorize('view', $membershipPrice ?? MembershipPrice::class);
            $this->authorize('view', $contractPrice ?? ContractPrice::class);
            $this->authorize('view', $gymSetting ?? GymSetting::class);

            return response()->json([
                'status' => 1,
                'data' => [
                    'membership_price' => $membershipPrice,
                    'contract_price'   => $contractPrice,
                    'gym_settings'     => $gymSetting,
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    public function MembershipFeePrice(MembershipPriceRequest $request)
    {
        try {
            $validated = $request->validated();
            $membershipPrice = MembershipPrice::first();

            if ($membershipPrice) {
                $this->authorize('update', $membershipPrice);
                $membershipPrice->update($validated);
                $status = 200;
                $message = 'Membership price updated.';
            } else {
                $this->authorize('create', MembershipPrice::class);
                $membershipPrice = MembershipPrice::create($validated);
                $status = 201;
                $message = 'Membership price created.';
            }

            return response()->json([
                'status' => 1,
                'message' => $message,
                'data' => $membershipPrice
            ], $status);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    public function ContractPrice(ContractPriceRequest $request)
    {
        try {
            $validated = $request->validated();
            $contractPrice = ContractPrice::first();

            if ($contractPrice) {
                $this->authorize('update', $contractPrice);
                $contractPrice->update($validated);
                $status = 200;
                $message = 'Contract price updated.';
            } else {
                $this->authorize('create', ContractPrice::class);
                $contractPrice = ContractPrice::create($validated);
                $status = 201;
                $message = 'Contract price created.';
            }

            return response()->json([
                'status' => 1,
                'message' => $message,
                'data' => $contractPrice
            ], $status);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.'
            ], 500);
        }
    }

    public function SystemSettings(SystemSettingRequest $request)
    {
        try {
            $gymSetting = GymSetting::first();
            $validated = $request->validated();
            $this->authorize('update', $gymSetting);

            $gymSetting->update($validated); // FIXED: removed GymSetting->

            return response()->json([
                'status' => 1,
                'message' => 'System settings updated successfully.',
                'data' => $gymSetting
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Server error.',
            ], 500);
        }
    }
}