<?php

use App\Http\Controllers\Api\AiChatController;
use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\TaskProgressController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => [
    'ok' => true,
    'service' => 'ai-physics-lab-api',
]);

Route::get('/subjects', [CatalogController::class, 'subjects']);
Route::get('/topics', [CatalogController::class, 'topics']);
Route::get('/theories', [CatalogController::class, 'theories']);
Route::get('/theories/{slug}', [CatalogController::class, 'theory']);
Route::get('/tasks', [CatalogController::class, 'tasks']);
Route::get('/labs', [CatalogController::class, 'labs']);
Route::post('/ai/chat', [AiChatController::class, 'reply']);

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth.token')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Tasks progress (DB-backed). Used by Tasks/Results/Teacher pages.
    Route::get('/me/tasks', [TaskProgressController::class, 'myTasks']);
    Route::get('/me/task-summary', [TaskProgressController::class, 'mySummary']);
    Route::get('/me/tasks/{taskCode}', [TaskProgressController::class, 'showTask']);
    Route::post('/tasks/{taskId}/draft', [TaskProgressController::class, 'saveDraft']);
    Route::post('/tasks/{taskId}/check', [TaskProgressController::class, 'checkAnswer']);

    Route::middleware('role:teacher,admin')->get('/teacher/task-stats', [TaskProgressController::class, 'teacherStats']);
    Route::middleware('role:teacher,admin')->post('/teacher/task-attempts/{attemptId}/review', [TaskProgressController::class, 'reviewAttempt']);

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::patch('/users/{user}', [AdminUserController::class, 'update']);
        Route::post('/users/{user}/reset-password', [AdminUserController::class, 'resetPassword']);
    });
});
