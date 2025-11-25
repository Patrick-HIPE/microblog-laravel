<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PostController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SearchController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard route
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // Search route
    Route::get('/global-search', SearchController::class)->name('global.search');
    // Post routes
    Route::resource('posts', PostController::class);
    // Profile routes 
    Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/users/{user}/toggle-follow', [ProfileController::class, 'toggleFollow'])->name('users.toggle-follow');
    Route::get('/profile/{user}/followers', [ProfileController::class, 'followers'])->name('profile.followers');
    Route::get('/profile/{user}/following', [ProfileController::class, 'following'])->name('profile.following');
});

require __DIR__.'/settings.php';
