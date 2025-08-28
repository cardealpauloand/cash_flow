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
<<<<<<< HEAD
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('sub-categories', [SubCategoryController::class, 'index']);
=======
    Route::apiResource('transactions', TransactionController::class)->only(['index', 'store', 'show', 'destroy']);
    // Full CRUD categories with optional ?with_subs=true
    Route::apiResource('categories', CategoryController::class);
    // Full CRUD sub-categories (filter by category_id optional)
    Route::apiResource('sub-categories', SubCategoryController::class);
>>>>>>> 8be227f92ff467c3f7f8a1a4f8db1cc1360778fd
    Route::get('tags', [TagController::class, 'index']);

    Route::get('dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('reports/summary', [ReportsController::class, 'summary']);
});
