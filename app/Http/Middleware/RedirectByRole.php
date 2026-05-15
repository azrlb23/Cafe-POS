<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectByRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, \Closure $next, string ...$guards): \Symfony\Component\HttpFoundation\Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (\Illuminate\Support\Facades\Auth::guard($guard)->check()) {
                $user = \Illuminate\Support\Facades\Auth::guard($guard)->user();
                \Illuminate\Support\Facades\Log::info('RedirectByRole: User authenticated', ['user_id' => $user->id, 'role' => $user->role]);
                
                if ($user->role === 'admin') {
                    \Illuminate\Support\Facades\Log::info('RedirectByRole: Redirecting Admin to dashboard');
                    return redirect()->route('dashboard');
                }
                
                \Illuminate\Support\Facades\Log::info('RedirectByRole: Redirecting Kasir to pos');
                return redirect()->route('pos');
            }
        }

        return $next($request);
    }
}
