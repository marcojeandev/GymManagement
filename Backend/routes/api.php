<?php
// Admin
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

// Cashier
use App\Http\Controllers\Cashier\DashboardController as CashierDashboardController;
use App\Http\Controllers\Cashier\MembersController as CashierMembersController;
use App\Http\Controllers\Cashier\ProductController as CashierProductController;
use App\Http\Controllers\Cashier\ContractController as CashierContractController;
use App\Http\Controllers\Cashier\WalkinAttendanceController as CashierWalkinAttendanceController;
use App\Http\Controllers\Cashier\SalesController as CashierSalesController;
use App\Http\Controllers\Cashier\AttendanceController as CashierAttendanceController;
use App\Http\Controllers\Cashier\WalkinInfoController as CashierWalkinInfoController;
use App\Http\Controllers\cashier\SettingsController as CashierSettingsController;


use App\Http\Controllers\SettingsController as PublicSettingsController;
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

Route::get('/gym-icon', [PublicSettingsController::class, 'getGymIcon']);
Route::get('/manifest.json', [PublicSettingsController::class, 'getManifest']);

Route::middleware(['auth:sanctum', 'admin', 'throttle:60,1'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function (){
        Route::get('dashboard', [DashboardController::class, 'index']);
        Route::get('sales-trend', [DashboardController::class, 'salesTrend']); // ✅ Add this
        Route::get('dashboard/sales-trend', [DashboardController::class, 'salesTrend']);

        // Users Management 
        Route::apiResource('users', UserController::class);
        Route::put('users/{user}/password', [UserController::class, 'changePassword'])->name('users.change-password');

        // Settings Management 
        Route::get('/membership-price', [SettingsController::class, 'getMembershipPrice']);
        Route::get('/gym-settings', [SettingsController::class, 'getGymSettings']);
        Route::post('/membership-fee', [SettingsController::class, 'MembershipFeePrice']);
        Route::post('/system-settings', [SettingsController::class, 'SystemSettings']);
        Route::prefix('contract-prices')->group(function () {
            Route::get('/', [SettingsController::class, 'getContractPrices']);
            Route::post('/', [SettingsController::class, 'storeContractPrice']);
            Route::put('/{contractPrice}', [SettingsController::class, 'updateContractPrice']);
            Route::delete('/{contractPrice}', [SettingsController::class, 'deleteContractPrice']);
        });

        // Members Management
        Route::apiResource('members', MembersController::class);
        Route::get('members/by-qr/{qrCode}', [MembersController::class, 'getByQR']);
        Route::post('members/{id}/resend-qr', [MembersController::class, 'resendQRCode']);

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
        Route::post('reports/clear-cache', [ReportsController::class, 'clearCache']);
    });

Route::middleware(['auth:sanctum', 'cashier', 'throttle:60,1'])
    ->prefix('cashier')
    ->name('cashier.')
    ->group(function (){
        
        Route::get('dashboard', [CashierDashboardController::class, 'index']);
        Route::get('sales-trend', [CashierDashboardController::class, 'salesTrend']);

        // Members Management
        Route::apiResource('members', CashierMembersController::class);
        Route::get('members/by-qr/{qrCode}', [CashierMembersController::class, 'getByQR']);

        // Contract Management
        Route::apiResource('contracts', CashierContractController::class);

        // Product Management
        Route::apiResource('products', CashierProductController::class);

        // Sales Management
        Route::apiResource('sales', CashierSalesController::class);

        // Walk-in Info Management
        Route::apiResource('walkin-info', CashierWalkinInfoController::class);

        // Walk-in Attendance Management
        Route::apiResource('walkin-attendance', CashierWalkinAttendanceController::class);

        // Attendance Management
        Route::apiResource('attendance', CashierAttendanceController::class);
        Route::post('attendance/scan', [CashierAttendanceController::class, 'scan'])->name('attendance.scan');

        // Settings Management 
        Route::get('/membership-price', [CashierSettingsController::class, 'getMembershipPrice']);
        Route::get('/gym-settings', [CashierSettingsController::class, 'getGymSettings']);
        Route::prefix('contract-prices')->group(function () {
            Route::get('/', [CashierSettingsController::class, 'getContractPrices']);
        });

        // Reports Management
        Route::prefix('reports')->group(function () {
            Route::get('sales-trend', [ReportsController::class, 'salesTrend']);
            Route::get('attendance-trend', [ReportsController::class, 'attendanceTrend']);
            Route::get('revenue', [ReportsController::class, 'revenueBreakdown']);
        });
    });
