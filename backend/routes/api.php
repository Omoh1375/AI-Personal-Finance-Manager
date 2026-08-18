<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FinancialInsightController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StatementController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\UserNotificationController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\SavingsDepositController;
use App\Http\Controllers\ProfileController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);

        Route::get('/profile', [AuthController::class, 'profile']);

    });

});

/*
|--------------------------------------------------------------------------
| Protected Finance Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Core Resources
    |--------------------------------------------------------------------------
    */

    Route::apiResource('categories', CategoryController::class);

    Route::apiResource('accounts', AccountController::class);

    Route::apiResource('incomes', IncomeController::class);

    Route::apiResource('expenses', ExpenseController::class);

    Route::apiResource('transfers', TransferController::class);

    Route::apiResource('budgets', BudgetController::class);

    Route::apiResource(
        'recurring-transactions',
        RecurringTransactionController::class
    );

    Route::apiResource(
            'savings-goals',
            SavingsGoalController::class
        )->only([
            'index',
            'store',
            'show',
            'destroy',
        ]);

        Route::apiResource(
            'savings-deposits',
            SavingsDepositController::class
        )->only([
            'index',
            'store',
            'show',
            'destroy',
        ]);

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get(
        'dashboard',
        [DashboardController::class, 'index']
    );

    /*
    |--------------------------------------------------------------------------
    | Statements
    |--------------------------------------------------------------------------
    */

    Route::get(
        'statements',
        [StatementController::class, 'index']
    );

    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    Route::get(
        'reports',
        [ReportController::class, 'index']
    );

    /*
    |--------------------------------------------------------------------------
    | Financial Insights
    |--------------------------------------------------------------------------
    */

    Route::get(
        'financial-insights',
        [FinancialInsightController::class, 'index']
    );

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get(
        'notifications',
        [UserNotificationController::class, 'index']
    );

    Route::get(
        'notifications/unread',
        [UserNotificationController::class, 'unread']
    );

    Route::patch(
        'notifications/{notification}/read',
        [UserNotificationController::class, 'markAsRead']
    );

    Route::middleware('auth:sanctum')->group(function () {

    Route::get(
        '/profile',
        [ProfileController::class, 'show']
    );

    Route::put(
        '/profile',
        [ProfileController::class, 'update']
    );

    Route::post(
        '/profile/photo',
        [ProfileController::class, 'uploadPhoto']
    );

    Route::delete(
        '/profile/photo',
        [ProfileController::class, 'deletePhoto']
    );

});



});