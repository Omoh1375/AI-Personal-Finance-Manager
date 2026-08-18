<?php

namespace App\Services;

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    public function generateSecret(
        User $user
    ): array {
        $secret =
            $this->google2fa
                ->generateSecretKey();

        $user->update([
            'two_factor_secret' => $secret,
            'two_factor_enabled' => false,
        ]);

        $appName =
            config(
                'app.name',
                'AI Personal Finance Manager'
            );

        $otpauthUrl =
            $this->google2fa
                ->getQRCodeUrl(
                    $appName,
                    $user->email,
                    $secret
                );

        return [
            'secret' => $secret,
            'otpauth_url' => $otpauthUrl,
        ];
    }

    public function verifyCode(
        User $user,
        string $code
    ): bool {
        if (
            !$user->two_factor_secret
        ) {
            return false;
        }

        return $this->google2fa
            ->verifyKey(
                $user->two_factor_secret,
                $code
            );
    }

    public function enable(
        User $user
    ): array {
        $codes =
            collect(range(1, 8))
                ->map(
                    fn () =>
                        strtoupper(
                            bin2hex(
                                random_bytes(5)
                            )
                        )
                )
                ->values()
                ->all();

        $user->update([
            'two_factor_enabled' => true,

            'two_factor_recovery_codes' =>
                $codes,
        ]);

        return $codes;
    }

    public function disable(
        User $user
    ): void {
        $user->update([
            'two_factor_enabled' => false,

            'two_factor_secret' => null,

            'two_factor_recovery_codes' =>
                null,
        ]);
    }

    public function regenerateRecoveryCodes(
        User $user
    ): array {
        $codes =
            collect(range(1, 8))
                ->map(
                    fn () =>
                        strtoupper(
                            bin2hex(
                                random_bytes(5)
                            )
                        )
                )
                ->values()
                ->all();

        $user->update([
            'two_factor_recovery_codes' =>
                $codes,
        ]);

        return $codes;
    }
}