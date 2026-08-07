<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\BudgetController;

// Authentication
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'profile']);
    });

});


// Finance API
Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('incomes', IncomeController::class);
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::apiResource('transfers', TransferController::class);
    Route::apiResource('budgets', BudgetController::class);
});