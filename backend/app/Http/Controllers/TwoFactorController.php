<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    private function google2fa(): Google2FA
    {
        return app(Google2FA::class);
    }

    /**
     * Current 2FA status.
     */
    public function status(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'two_factor_enabled' =>
                (bool) $user->two_factor_enabled,

            'has_recovery_codes' =>
                is_array(
                    $user->two_factor_recovery_codes
                ) &&
                count(
                    $user->two_factor_recovery_codes
                ) > 0,

            'confirmed_at' =>
                $user->two_factor_confirmed_at,
        ]);
    }

    /**
     * Generate a new 2FA secret and QR URL.
     */
    public function setup(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if ($user->two_factor_enabled) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Two-factor authentication is already enabled.',
            ], 409);
        }

        $google2fa = $this->google2fa();

        $secret =
            $google2fa->generateSecretKey();

        $qrUrl =
            $google2fa->getQRCodeUrl(
                config(
                    'app.name',
                    'AI Personal Finance Manager'
                ),
                $user->email,
                $secret
            );

        /*
         * Store the secret encrypted through the
         * User model cast.
         */
        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_enabled' => false,
        ])->save();

        return response()->json([
            'success' => true,

            'message' =>
                'Two-factor setup initialized.',

            'secret' => $secret,

            'qr_code_url' => $qrUrl,
        ]);
    }

    /**
     * Confirm the first authenticator code and enable 2FA.
     */
    public function enable(
        Request $request
    ): JsonResponse {
        $request->validate([
            'code' => [
                'required',
                'digits:6',
            ],
        ]);

        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Please initialize 2FA setup first.',
            ], 422);
        }

        if ($user->two_factor_enabled) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Two-factor authentication is already enabled.',
            ], 409);
        }

        $valid =
            $this->google2fa()->verifyKey(
                $user->two_factor_secret,
                $request->string('code')->toString()
            );

        if (! $valid) {
            return response()->json([
                'success' => false,
                'message' =>
                    'The authenticator code is invalid or expired.',
            ], 422);
        }

        $recoveryCodes =
            $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_enabled' => true,

            'two_factor_confirmed_at' =>
                now(),

            'two_factor_recovery_codes' =>
                $recoveryCodes,
        ])->save();

        return response()->json([
            'success' => true,

            'message' =>
                'Two-factor authentication has been enabled.',

            'recovery_codes' =>
                $recoveryCodes,
        ]);
    }

    /**
     * Disable 2FA after verifying the current authenticator code.
     */
    public function disable(
        Request $request
    ): JsonResponse {
        $request->validate([
            'code' => [
                'required',
                'digits:6',
            ],
        ]);

        $user = $request->user();

        if (! $user->two_factor_enabled) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Two-factor authentication is already disabled.',
            ], 409);
        }

        $valid =
            $this->google2fa()->verifyKey(
                $user->two_factor_secret,
                $request->string('code')->toString()
            );

        if (! $valid) {
            return response()->json([
                'success' => false,
                'message' =>
                    'The authenticator code is invalid or expired.',
            ], 422);
        }

        $user->forceFill([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
        ])->save();

        return response()->json([
            'success' => true,

            'message' =>
                'Two-factor authentication has been disabled.',
        ]);
    }

    /**
     * Generate a new set of recovery codes.
     */
    public function regenerateRecoveryCodes(
        Request $request
    ): JsonResponse {
        $request->validate([
            'code' => [
                'required',
                'digits:6',
            ],
        ]);

        $user = $request->user();

        if (! $user->two_factor_enabled) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Enable two-factor authentication first.',
            ], 422);
        }

        $valid =
            $this->google2fa()->verifyKey(
                $user->two_factor_secret,
                $request->string('code')->toString()
            );

        if (! $valid) {
            return response()->json([
                'success' => false,
                'message' =>
                    'The authenticator code is invalid or expired.',
            ], 422);
        }

        $recoveryCodes =
            $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_recovery_codes' =>
                $recoveryCodes,
        ])->save();

        return response()->json([
            'success' => true,

            'message' =>
                'Recovery codes regenerated successfully.',

            'recovery_codes' =>
                $recoveryCodes,
        ]);
    }

    private function generateRecoveryCodes(): array
    {
        $codes = [];

        for ($i = 0; $i < 8; $i++) {
            $codes[] =
                strtoupper(
                    Str::random(10)
                );
        }

        return $codes;
    }
}