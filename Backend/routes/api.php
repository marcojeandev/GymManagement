<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GymSettingController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/settings', [GymSettingController::class, 'getSettings']);
Route::post('/settings', [GymSettingController::class, 'updateSettings']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
