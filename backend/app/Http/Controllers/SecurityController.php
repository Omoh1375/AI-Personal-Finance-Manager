<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\TwoFactorCodeRequest;
use App\Services\TwoFactorService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SecurityController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TwoFactorService $twoFactorService
    ) {}

    public function status(
        Request $request
    ) {
        $user = $request->user();

        return $this->success([
            'two_factor_enabled' =>
                (bool) $user->two_factor_enabled,

            'has_recovery_codes' =>
                !empty(
                    $user->two_factor_recovery_codes
                ),
        ]);
    }

    public function changePassword(
        ChangePasswordRequest $request
    ) {
        $user = $request->user();

        $user->update([
            'password' => $request->password,
        ]);

        return $this->success(
            null,
            'Password changed successfully.'
        );
    }

    public function setup(
        Request $request
    ) {
        $user = $request->user();

        $setup =
            $this->twoFactorService
                ->generateSecret($user);

        return $this->success([
            'secret' =>
                $setup['secret'],

            'otpauth_url' =>
                $setup['otpauth_url'],
        ]);
    }

    public function enable(
        TwoFactorCodeRequest $request
    ) {
        $user = $request->user();

        if (
            !$user->two_factor_secret
        ) {
            return $this->error(
                'Please start the 2FA setup first.',
                null,
                422
            );
        }

        if (
            !$this->twoFactorService
                ->verifyCode(
                    $user,
                    $request->code
                )
        ) {
            return $this->error(
                'Invalid authentication code.',
                null,
                422
            );
        }

        $codes =
            $this->twoFactorService
                ->enable($user);

        return $this->success(
            [
                'two_factor_enabled' =>
                    true,

                'recovery_codes' =>
                    $codes,
            ],
            'Two-factor authentication enabled successfully.'
        );
    }

    public function disable(
        Request $request
    ) {
        $request->validate([
            'password' => [
                'required',
                'current_password',
            ],

            'code' => [
                'nullable',
                'digits:6',
            ],
        ]);

        $user = $request->user();

        if (
            $user->two_factor_enabled
        ) {
            if (
                !$request->code ||
                !$this->twoFactorService
                    ->verifyCode(
                        $user,
                        $request->code
                    )
            ) {
                return $this->error(
                    'A valid 2FA code is required to disable two-factor authentication.',
                    null,
                    422
                );
            }
        }

        $this->twoFactorService
            ->disable($user);

        return $this->success(
            null,
            'Two-factor authentication disabled.'
        );
    }

    public function regenerateRecoveryCodes(
        TwoFactorCodeRequest $request
    ) {
        $user = $request->user();

        if (
            !$user->two_factor_enabled
        ) {
            return $this->error(
                'Two-factor authentication is not enabled.',
                null,
                422
            );
        }

        if (
            !$this->twoFactorService
                ->verifyCode(
                    $user,
                    $request->code
                )
        ) {
            return $this->error(
                'Invalid authentication code.',
                null,
                422
            );
        }

        $codes =
            $this->twoFactorService
                ->regenerateRecoveryCodes(
                    $user
                );

        return $this->success(
            [
                'recovery_codes' =>
                    $codes,
            ],
            'Recovery codes regenerated successfully.'
        );
    }
}