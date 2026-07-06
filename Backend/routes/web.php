<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SettingsController;

// ✅ Public routes – must be BEFORE any auth middleware
Route::get('/manifest', [SettingsController::class, 'getManifest']);
Route::get('/gym-icon', [SettingsController::class, 'getGymIcon']);

// Your other routes (auth, dashboard) go below