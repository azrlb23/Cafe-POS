<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            \Illuminate\Support\Facades\Log::info('Login process started', ['request_ip' => $request->ip(), 'email' => $request->email]);
            
            $request->authenticate();
            $request->session()->regenerate();

            $user = Auth::user();
            \Illuminate\Support\Facades\Log::info('Authentication successful', ['user_id' => $user->id, 'email' => $user->email, 'role' => $user->role]);

            if ($user->hasRole('admin') || $user->role === 'admin') {
                \Illuminate\Support\Facades\Log::info('Redirecting to dashboard (Admin role detected)');
                return redirect()->route('dashboard');
            }

            \Illuminate\Support\Facades\Log::info('Redirecting to pos (Non-admin role detected)');
            return redirect()->route('pos');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Authentication exception caught', [
                'message' => $e->getMessage(),
                'email' => $request->email,
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
