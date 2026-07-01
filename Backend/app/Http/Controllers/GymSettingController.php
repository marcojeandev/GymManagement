<?php

namespace App\Http\Controllers;

use App\Models\GymSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GymSettingController extends Controller
{
    public function getSettings()
    {
        $settings = GymSetting::first(); // or create default
        return response()->json([
            'status' => 1,
            'data' => $settings ?? (object) [] // return empty object if none
        ]);
    }

    public function updateSettings(Request $request)
{
    // Let validation throw its own 422 response
    $validated = $request->validate([
        'gym_name' => 'nullable|string|max:255',
        'description' => 'nullable|string',
        'location' => 'nullable|string',
        'email' => 'nullable|email',
        'contact' => 'nullable|string|max:20',
        'social_links' => 'nullable|array',
        'features' => 'nullable|array',
        'pricing' => 'nullable|array',
        'primary_color' => 'nullable|string',
        'secondary_color' => 'nullable|string',
        'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        'favicon' => 'nullable|image|mimes:ico,png|max:512',
        'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Get the settings record (ensure it exists)
    $settings = GymSetting::first(); // or firstOrCreate()
    if (!$settings) {
        $settings = GymSetting::create([]); // create empty record
    }

    // Handle logo
    if ($request->hasFile('logo')) {
        if ($settings->logo) {
            Storage::delete('public/' . $settings->logo);
        }
        $path = $request->file('logo')->store('gym-logos', 'public');
        $validated['logo'] = $path;
    }

    // Handle favicon
    if ($request->hasFile('favicon')) {
        if ($settings->favicon) {
            Storage::delete('public/' . $settings->favicon);
        }
        $path = $request->file('favicon')->store('gym-favicons', 'public');
        $validated['favicon'] = $path;
    }

    // Handle gallery
    if ($request->hasFile('gallery')) {
        $gallery = [];
        foreach ($request->file('gallery') as $file) {
            $gallery[] = $file->store('gym-gallery', 'public');
        }
        $validated['gallery'] = $gallery;
    }

    $settings->update($validated);

    return response()->json([
        'status' => 1,
        'message' => 'Settings updated successfully.',
        'data' => $settings
    ]);
}
}