<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController, UserController, AccountController, TransactionController, CategoryController, SubCategoryController, TagController, DashboardController};
use App\Http\Controllers\ReportsController;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
});

Route::middleware('auth:api')->group(function () {
    Route::get('users/me', [UserController::class, 'me']);
    Route::put('users/me', [UserController::class, 'updateMe']);

    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::get('transactions/count', [TransactionController::class, 'count']);
    Route::apiResource('categories', CategoryController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::get('sub-categories', [SubCategoryController::class, 'index']);
    Route::get('tags', [TagController::class, 'index']);

    Route::get('dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('reports/summary', [ReportsController::class, 'summary']);
});
