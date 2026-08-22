<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => [
        '*',
    ],

    'allowed_origins' => array_values(
        array_filter(
            explode(
                ',',
                env(
                    'CORS_ALLOWED_ORIGINS',
                    'http://localhost:5173,http://127.0.0.1:5173'
                )
            )
        )
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        '*',
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    /*
    |----------------------------------------------------------------------
    | Credentials
    |--------------------------------------------------------------------------
    |
    | Your application currently authenticates API requests using
    | Authorization: Bearer <token>, so cookies are not required.
    |
    */

    'supports_credentials' => false,

];