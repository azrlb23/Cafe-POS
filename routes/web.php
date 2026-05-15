<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'role:admin'])->name('dashboard');

Route::middleware(['auth', 'verified', 'role:kasir'])->group(function () {
    Route::get('/pos', [\App\Http\Controllers\PosController::class, 'index'])->name('pos');
    Route::get('/pos/history', [\App\Http\Controllers\PosController::class, 'history'])->name('pos.history');
    Route::post('/pos/orders/{order}/void', [\App\Http\Controllers\PosController::class, 'voidOrder'])->name('pos.orders.void');
    Route::post('/pos/shifts/start', [\App\Http\Controllers\PosController::class, 'startShift'])->name('pos.shifts.start');
    Route::post('/pos/shifts/end', [\App\Http\Controllers\PosController::class, 'endShift'])->name('pos.shifts.end');
    Route::post('/pos/orders', [\App\Http\Controllers\PosController::class, 'submitOrder'])->name('pos.orders');
    Route::post('/pos/petty-cash', [\App\Http\Controllers\PosController::class, 'storePettyCash'])->name('pos.petty-cash');
});

Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);
    Route::resource('menus', \App\Http\Controllers\Admin\MenuController::class);
    Route::resource('raw-materials', \App\Http\Controllers\Admin\RawMaterialController::class);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/logout', function (\Illuminate\Http\Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
});

require __DIR__.'/auth.php';
