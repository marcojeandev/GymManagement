<?php

namespace App\Http\Controllers;

use App\Models\GymSetting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    /**
     * Serve the gym icon (favicon or logo) as an image.
     * Falls back to default favicon.ico if not set.
     */
    public function getGymIcon()
    {
        try {
            $settings = GymSetting::first();

            if (!$settings || !$settings->favicon) {
                return response()->file(public_path('favicon.ico'));
            }

            $path = storage_path('app/public/' . $settings->favicon);
            if (!file_exists($path)) {
                return response()->file(public_path('favicon.ico'));
            }

            return response()->file($path);
        } catch (\Exception $e) {
            Log::error('Gym icon error: ' . $e->getMessage());
            return response()->file(public_path('favicon.ico'));
        }
    }

    /**
     * Serve the PWA manifest as JSON, dynamically built from system_settings.
     * Always returns valid JSON, even if the database is empty.
     */
    public function getManifest()
    {
        try {
            $settings = GymSetting::first();

            // Fallback values if settings not found
            $gymName = $settings->gym_name ?? 'Gym Management';
            $primaryColor = $settings->primary_color ?? '#ef4444';
            $iconUrl = ($settings && $settings->favicon) 
                ? url('/gym-icon') 
                : url('/favicon.ico');

            // ✅ Ensure the icon URL is absolute
            $iconUrl = asset($iconUrl);

            return response()->json([
                'name' => $gymName,
                'short_name' => 'GymApp',
                'description' => 'Manage your gym members, contracts, sales and attendance.',
                'theme_color' => $primaryColor,
                'background_color' => '#0b0d10',
                'display' => 'standalone',
                'start_url' => '/',
                'icons' => [
                    [
                        'src' => $iconUrl,
                        'sizes' => '192x192',
                        'type' => 'image/png',
                        'purpose' => 'any maskable',
                    ],
                    [
                        'src' => $iconUrl,
                        'sizes' => '512x512',
                        'type' => 'image/png',
                        'purpose' => 'any maskable',
                    ],
                ],
            ], 200, ['Content-Type' => 'application/json']);
        } catch (\Exception $e) {
            // Log the error for debugging
            Log::error('Manifest error: ' . $e->getMessage());
            Log::error('Manifest trace: ' . $e->getTraceAsString());

            // ✅ Always return a valid fallback manifest
            return response()->json([
                'name' => 'Gym Management',
                'short_name' => 'GymApp',
                'description' => 'Gym Management System',
                'theme_color' => '#ef4444',
                'background_color' => '#0b0d10',
                'display' => 'standalone',
                'start_url' => '/',
                'icons' => [
                    [
                        'src' => '/favicon.ico',
                        'sizes' => '192x192',
                        'type' => 'image/png',
                    ],
                    [
                        'src' => '/favicon.ico',
                        'sizes' => '512x512',
                        'type' => 'image/png',
                    ],
                ],
            ], 200, ['Content-Type' => 'application/json']);
        }
    }
}