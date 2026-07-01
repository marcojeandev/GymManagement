<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        try {
            $validated = $request->validated();

            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'status' => 0,
                    'message' => 'Invalid credentials.'
                ], 401);
            }

            $user = Auth::user();

            if ($user->account_status !== 'active') {
                Auth::logout(); // Prevent session being used
                return response()->json([
                    'status' => 0,
                    'message' => 'Your account is not active. Please contact support.'
                ], 403);
            }

            $user->tokens()->delete();

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => 1,
                'message' => 'Login successful.',
                'data' => [
                    'user' => $user->only(['id', 'name', 'email', 'role', 'status']),
                    'token' => $token,
                    'token_type' => 'Bearer',
                ]
            ], 200);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Login failed. Please try again later.'
            ], 500);
        }
    }
}
