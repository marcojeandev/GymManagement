<?php
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MembersController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ContractController;
use App\Http\Controllers\Admin\WalkinAttendanceController;
use App\Http\Controllers\Admin\SalesController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\WalkinInfoController;
use App\Http\Controllers\Admin\ReportsController;
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
        // Dashboard Management
        Route::get('dashboard', [DashboardController::class, 'index']);

        // Users Management 
        Route::apiResource('users', UserController::class);
        Route::put('users/{user}/password', [UserController::class, 'changePassword'])->name('users.change-password');

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

        // Product Management
        Route::apiResource('products', ProductController::class);

        // Sales Management
        Route::apiResource('sales', SalesController::class);

        // Walk-in Info Management
        Route::apiResource('walkin-info', WalkinInfoController::class);

        // Walk-in Attendance Management
        Route::apiResource('walkin-attendance', WalkinAttendanceController::class);

        // Attendance Management
        Route::apiResource('attendance', AttendanceController::class);
        Route::post('attendance/scan', [AttendanceController::class, 'scan'])->name('attendance.scan');

        // Reports Management
        Route::prefix('reports')->group(function () {
            Route::get('overview', [ReportsController::class, 'overview']);
            Route::get('member-growth', [ReportsController::class, 'memberGrowth']);
            Route::get('sales-trend', [ReportsController::class, 'salesTrend']);
            Route::get('top-products', [ReportsController::class, 'topProducts']);
            Route::get('attendance-trend', [ReportsController::class, 'attendanceTrend']);
            Route::get('sales-by-payment', [ReportsController::class, 'salesByPaymentType']);
            Route::get('membership-distribution', [ReportsController::class, 'membershipStatusDistribution']);
            Route::get('contract-distribution', [ReportsController::class, 'contractStatusDistribution']);
            Route::get('attendance-distribution', [ReportsController::class, 'attendanceDistribution']);
            Route::get('revenue', [ReportsController::class, 'revenueBreakdown']);
        });
    });
