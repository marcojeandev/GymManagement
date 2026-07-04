<?php

use App\Http\Controllers\Admin\MembersController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ContractController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GymSettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('login');  

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

Route::get('/settings', [GymSettingController::class, 'getSettings']);
Route::post('/settings', [GymSettingController::class, 'updateSettings']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'admin', 'throttle:60,1'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (){
        // Settings Management 
        Route::get('/membership-price', [SettingsController::class, 'getMembershipPrice']);
        // Route::get('/contract-price', [SettingsController::class, 'getContractPrice']);
        Route::get('/gym-settings', [SettingsController::class, 'getGymSettings']);
        Route::post('/membership-fee', [SettingsController::class, 'MembershipFeePrice']);
        // Route::post('/contract-price', [SettingsController::class, 'ContractPrice']);
        Route::post('/system-settings', [SettingsController::class, 'SystemSettings']);
        Route::prefix('contract-prices')->group(function () {
            Route::get('/', [SettingsController::class, 'getContractPrices']);
            Route::post('/', [SettingsController::class, 'storeContractPrice']);
            Route::put('/{contractPrice}', [SettingsController::class, 'updateContractPrice']);
            Route::delete('/{contractPrice}', [SettingsController::class, 'deleteContractPrice']);
        });

        // Members Management
        Route::apiResource('members', MembersController::class);

        // Contract Management
        Route::apiResource('contracts', ContractController::class);
    });
