<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register user.
     */
    public function register(
        RegisterRequest $request
    ): JsonResponse {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make(
                $request->password
            ),
        ]);

        event(
            new Registered($user)
        );

        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' =>
                'Registration successful.',
            'token' => $token,
            'user' =>
                new UserResource($user),
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(
        LoginRequest $request
    ): JsonResponse {
        $user = User::where(
            'email',
            $request->email
        )->first();

        if (
            ! $user ||
            ! Hash::check(
                $request->password,
                $user->password
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Invalid credentials.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | 2FA
        |--------------------------------------------------------------------------
        |
        | We will enforce 2FA here later.
        | For now normal login remains unchanged.
        |
        */

        $token = $user
            ->createToken('auth_token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' =>
                'Login successful.',
            'token' => $token,
            'user' =>
                new UserResource($user),
        ]);
    }

    /**
     * Logout.
     */
    public function logout(
        Request $request
    ): JsonResponse {
        $request
            ->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Logged out successfully.',
        ]);
    }

    /**
     * Current authenticated profile.
     */
    public function profile(
        Request $request
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'user' =>
                new UserResource(
                    $request->user()
                ),
        ]);
    }

    /**
     * Send password reset link.
     *
     * This intentionally returns the same response
     * whether the email exists or not.
     */
    public function forgotPassword(
        Request $request
    ): JsonResponse {
        $request->validate([
            'email' => [
                'required',
                'email',
            ],
        ]);

        Password::sendResetLink([
            'email' =>
                $request->email,
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'If an account exists with that email address, a password reset link has been sent.',
        ]);
    }

    /**
     * Reset password.
     */
    public function resetPassword(
        Request $request
    ): JsonResponse {
        $request->validate([
            'token' => [
                'required',
                'string',
            ],

            'email' => [
                'required',
                'email',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $status = Password::reset(
            [
                'email' =>
                    $request->email,

                'password' =>
                    $request->password,

                'password_confirmation' =>
                    $request
                        ->password_confirmation,

                'token' =>
                    $request->token,
            ],
            function (
                User $user,
                string $password
            ) {
                $user->forceFill([
                    'password' =>
                        Hash::make(
                            $password
                        ),

                    'remember_token' =>
                        Str::random(60),
                ])->save();

                /*
                |--------------------------------------------------------------------------
                | Revoke existing Sanctum tokens
                |--------------------------------------------------------------------------
                |
                | This forces the user to authenticate again
                | after changing their password.
                |
                */

                $user
                    ->tokens()
                    ->delete();

                event(
                    new PasswordReset($user)
                );
            }
        );

        if (
            $status !==
            Password::PASSWORD_RESET
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    __($status),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' =>
                'Your password has been reset successfully.',
        ]);
    }
}