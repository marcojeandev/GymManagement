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

    /**
 * Get all contract prices.
 */
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

/**
 * Store a new contract price.
 */
public function storeContractPrice(ContractPriceRequest $request)
{
    try {
        $this->authorize('create', ContractPrice::class);
        $validated = $request->validated();
        $contractPrice = ContractPrice::create($validated);
        return response()->json([
            'status' => 1,
            'message' => 'Contract price created.',
            'data' => $contractPrice,
        ], 201);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 0,
            'message' => 'Server error: ' . $e->getMessage(),
        ], 500);
    }
}

/**
 * Update an existing contract price.
 */
public function updateContractPrice(ContractPriceRequest $request, ContractPrice $contractPrice)
{
    try {
        $this->authorize('update', $contractPrice);
        $validated = $request->validated();
        $contractPrice->update($validated);
        return response()->json([
            'status' => 1,
            'message' => 'Contract price updated.',
            'data' => $contractPrice,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 0,
            'message' => 'Server error: ' . $e->getMessage(),
        ], 500);
    }
}

/**
 * Delete a contract price.
 */
public function deleteContractPrice(ContractPrice $contractPrice)
{
    try {
        $this->authorize('delete', $contractPrice);
        $contractPrice->delete();
        return response()->json([
            'status' => 1,
            'message' => 'Contract price deleted.',
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 0,
            'message' => 'Server error: ' . $e->getMessage(),
        ], 500);
    }
}

    /**
     * Serve the gym logo/favicon from storage or fallback.
     */
    public function getGymIcon()
    {
        $settings = GymSetting::first();
        $iconPath = null;

        if ($settings) {
            if ($settings->favicon) {
                $iconPath = storage_path('app/public/' . $settings->favicon);
            } elseif ($settings->logo) {
                $iconPath = storage_path('app/public/' . $settings->logo);
            }
        }

        if ($iconPath && file_exists($iconPath)) {
            $mimeType = mime_content_type($iconPath) ?: 'image/png';
            return response()->file($iconPath, [
                'Content-Type' => $mimeType,
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        // Fallback to favicon.ico in the public directory if it exists
        $defaultFavicon = public_path('favicon.ico');
        if (file_exists($defaultFavicon)) {
            return response()->file($defaultFavicon, [
                'Content-Type' => 'image/x-icon',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        }

        // Fallback: Default SVG placeholder
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="50" fill="#ef4444"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="32">GYM</text></svg>';
        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}