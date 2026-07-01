<?php

namespace App\Http\Controllers;

use App\Models\GymSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;

class GymSettingController extends Controller
{
    public function getSettings()
    {
        $settings = GymSetting::first();
        return response()->json([
            'status' => 1,
            'data'   => $settings ?? (object) []
        ]);
    }

    public function updateSettings(Request $request)
    {
        // Prevent re-setup if an admin already exists
        if (User::where('role', 'admin')->exists()) {
            return response()->json([
                'status'  => 0,
                'message' => 'System is already configured. Please log in.',
            ], 403);
        }

        $validated = $request->validate([
            // ── Gym info ──────────────────────────────────
            'gym_name'    => 'required|string|max:255',
            'description' => 'nullable|string',
            'location'    => 'nullable|string',
            'email'       => 'nullable|email',
            'contact'     => 'nullable|string|max:20',
            'social_links'=> 'nullable|array',
            'features'    => 'nullable|array',
            'pricing'     => 'nullable|array',
            'primary_color'   => 'nullable|string',
            'secondary_color' => 'nullable|string',
            'logo'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:512',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            // ── Admin account ─────────────────────────────
            'admin_name'     => 'required|string|max:255',
            'admin_email'    => 'required|email|unique:users,email',
            'admin_password' => ['required', 'string', Password::min(8)],
        ]);

        DB::transaction(function () use ($request, $validated) {
            // ── 1. Create / update gym settings ───────────
            $settings = GymSetting::first() ?? new GymSetting();

            $settings->gym_name    = $validated['gym_name'];
            $settings->description = $validated['description'] ?? null;
            $settings->location    = $validated['location']    ?? null;
            $settings->email       = $validated['email']       ?? null;
            $settings->contact     = $validated['contact']     ?? null;

            if ($request->hasFile('logo')) {
                if ($settings->logo) Storage::delete('public/' . $settings->logo);
                $settings->logo = $request->file('logo')->store('gym-logos', 'public');
            }

            if ($request->hasFile('favicon')) {
                if ($settings->favicon) Storage::delete('public/' . $settings->favicon);
                $settings->favicon = $request->file('favicon')->store('gym-favicons', 'public');
            }

            if ($request->hasFile('gallery')) {
                $gallery = [];
                foreach ($request->file('gallery') as $file) {
                    $gallery[] = $file->store('gym-gallery', 'public');
                }
                $settings->gallery = $gallery;
            }

            $settings->save();

            // ── 2. Create the first admin account ─────────
            User::create([
                'name'           => $validated['admin_name'],
                'email'          => $validated['admin_email'],
                'password'       => Hash::make($validated['admin_password']),
                'role'           => 'admin',
                'account_status' => 'active',
            ]);
        });

        return response()->json([
            'status'  => 1,
            'message' => 'Gym configured and admin account created successfully.',
        ]);
    }
}