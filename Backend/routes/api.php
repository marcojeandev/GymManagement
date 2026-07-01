<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GymSettingController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\MembersController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/settings', [GymSettingController::class, 'getSettings']);
Route::post('/settings', [GymSettingController::class, 'updateSettings']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'admin', 'active', 'throttle:60,1'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (){
        // Settings Management 
        Route::get('/settings', [SettingsController::class, 'index']);
        Route::post('/settings', [SettingsController::class, 'MembershipFeePrice']);
        Route::post('/settings', [SettingsController::class, 'ContractPrice']);
        Route::post('/settings', [SettingsController::class, 'SystemSettings']);

        // Members Management
        Route::apiResource('members', MembersController::class);
    });
