<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CashierMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!auth('sanctum')->check()) {
            abort(403, 'Unauthenticated. Please login first.');
        }

        // Check if user has cashier role
        $user = auth('sanctum')->user();
        if (!$user->isCashier() && !$user->isAdmin()) {
            abort(403, 'Cashier access only');
        }

        return $next($request);
    }
}