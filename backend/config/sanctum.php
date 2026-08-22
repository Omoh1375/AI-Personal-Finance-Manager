<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains
    |--------------------------------------------------------------------------
    |
    | These are the domains that may use Sanctum's stateful authentication
    | mechanism. Your current frontend uses Bearer tokens, but keeping the
    | configuration environment-driven makes the application ready for
    | future first-party SPA authentication if needed.
    |
    */

    'stateful' => array_values(
        array_filter(
            explode(
                ',',
                env(
                    'SANCTUM_STATEFUL_DOMAINS',
                    'localhost,localhost:5173,127.0.0.1,127.0.0.1:5173,::1'
                )
            )
        )
    ),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    */

    'guard' => [
        'web',
    ],

    /*
    |--------------------------------------------------------------------------
    | Expiration Minutes
    |--------------------------------------------------------------------------
    */

    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Token Prefix
    |--------------------------------------------------------------------------
    */

    'token_prefix' => env(
        'SANCTUM_TOKEN_PREFIX',
        ''
    ),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Middleware
    |--------------------------------------------------------------------------
    */

    'middleware' => [
        'authenticate_session' =>
            \Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,

        'encrypt_cookies' =>
            EncryptCookies::class,

        'validate_csrf_token' =>
            ValidateCsrfToken::class,
    ],

];