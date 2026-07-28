<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AccountController;

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

});