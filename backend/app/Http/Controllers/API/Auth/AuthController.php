<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    /**
     * Register user.
     */
    public function register(
        RegisterRequest $request
    ): JsonResponse {
        $user = User::create([
            'name' =>
                $request->name,

            'email' =>
                $request->email,

            'password' =>
                Hash::make(
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
            'success' =>
                true,

            'message' =>
                'Registration successful.',

            'token' =>
                $token,

            'user' =>
                new UserResource($user),
        ], 201);
    }

    /**
     * Login user.
     *
     * If 2FA is enabled, do not issue a real
     * Sanctum token yet. Issue a short-lived
     * challenge token instead.
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
                'success' =>
                    false,

                'message' =>
                    'Invalid credentials.',
            ], 401);
        }

        /*
        |--------------------------------------------------------------------------
        | 2FA challenge
        |--------------------------------------------------------------------------
        */

        if ($user->two_factor_enabled) {
            $challengeToken =
                Str::random(80);

            Cache::put(
                $this->twoFactorChallengeKey(
                    $challengeToken
                ),
                [
                    'user_id' =>
                        $user->id,
                ],
                now()->addMinutes(10)
            );

            return response()->json([
                'success' =>
                    true,

                'requires_two_factor' =>
                    true,

                'message' =>
                    'Two-factor authentication is required.',

                'challenge_token' =>
                    $challengeToken,
            ], 202);
        }

        /*
        |--------------------------------------------------------------------------
        | Normal login
        |--------------------------------------------------------------------------
        */

        return $this->issueLoginToken(
            $user
        );
    }

    /**
     * Verify the 2FA code after password authentication.
     */
    public function verifyTwoFactorLogin(
        Request $request
    ): JsonResponse {
        $request->validate([
            'challenge_token' => [
                'required',
                'string',
                'min:40',
                'max:100',
            ],

            'code' => [
                'required',
                'string',
                'max:20',
            ],
        ]);

        $challengeToken =
            $request->string(
                'challenge_token'
            )->toString();

        $cacheKey =
            $this->twoFactorChallengeKey(
                $challengeToken
            );

        $challenge =
            Cache::get($cacheKey);

        if (! $challenge) {
            return response()->json([
                'success' =>
                    false,

                'message' =>
                    'Your verification session has expired. Please sign in again.',
            ], 422);
        }

        $user =
            User::find(
                $challenge['user_id']
            );

        if (
            ! $user ||
            ! $user->two_factor_enabled ||
            ! $user->two_factor_secret
        ) {
            Cache::forget(
                $cacheKey
            );

            return response()->json([
                'success' =>
                    false,

                'message' =>
                    'Two-factor verification is no longer available for this account.',
            ], 422);
        }

        $code =
            $request->string(
                'code'
            )->toString();

        /*
        |--------------------------------------------------------------------------
        | Authenticator code
        |--------------------------------------------------------------------------
        */

        $valid =
            $this->google2fa()
                ->verifyKey(
                    $user->two_factor_secret,
                    $code
                );

        /*
        |--------------------------------------------------------------------------
        | Recovery code
        |--------------------------------------------------------------------------
        */

        if (! $valid) {
            $recoveryCodes =
                $user->two_factor_recovery_codes;

            if (
                is_array(
                    $recoveryCodes
                )
            ) {
                $normalizedCode =
                    strtoupper(
                        trim($code)
                    );

                $index =
                    collect(
                        $recoveryCodes
                    )->search(
                        fn ($recoveryCode) =>
                            strtoupper(
                                trim(
                                    (string)
                                    $recoveryCode
                                )
                            ) ===
                            $normalizedCode
                    );

                if ($index !== false) {
                    unset(
                        $recoveryCodes[$index]
                    );

                    $user->forceFill([
                        'two_factor_recovery_codes' =>
                            array_values(
                                $recoveryCodes
                            ),
                    ])->save();

                    $valid = true;
                }
            }
        }

        if (! $valid) {
            return response()->json([
                'success' =>
                    false,

                'message' =>
                    'The verification code is invalid or expired.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Consume challenge
        |--------------------------------------------------------------------------
        */

        Cache::forget(
            $cacheKey
        );

        /*
        |--------------------------------------------------------------------------
        | Issue real Sanctum token
        |--------------------------------------------------------------------------
        */

        return $this->issueLoginToken(
            $user,
            'Two-factor authentication successful.'
        );
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
            'success' =>
                true,

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
            'success' =>
                true,

            'user' =>
                new UserResource(
                    $request->user()
                ),
        ]);
    }

    /**
     * Send password reset link.
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
            'success' =>
                true,

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

        $status =
            Password::reset(
                [
                    'email' =>
                        $request->email,

                    'password' =>
                        $request->password,

                    'password_confirmation' =>
                        $request->password_confirmation,

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
                    | Revoke all existing Sanctum tokens
                    |--------------------------------------------------------------------------
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
                'success' =>
                    false,

                'message' =>
                    __($status),
            ], 422);
        }

        return response()->json([
            'success' =>
                true,

            'message' =>
                'Your password has been reset successfully.',
        ]);
    }

    /**
     * Issue a normal authenticated Sanctum token.
     */
    private function issueLoginToken(
        User $user,
        string $message = 'Login successful.'
    ): JsonResponse {
        $token =
            $user
                ->createToken(
                    'auth_token'
                )
                ->plainTextToken;

        return response()->json([
            'success' =>
                true,

            'message' =>
                $message,

            'requires_two_factor' =>
                false,

            'token' =>
                $token,

            'user' =>
                new UserResource($user),
        ]);
    }

    /**
     * Generate the cache key for a 2FA challenge.
     */
    private function twoFactorChallengeKey(
        string $challengeToken
    ): string {
        return 'auth:2fa:challenge:' .
            hash(
                'sha256',
                $challengeToken
            );
    }

    /**
     * Resolve Google 2FA service.
     */
    private function google2fa(): Google2FA
    {
        return app(
            Google2FA::class
        );
    }
}