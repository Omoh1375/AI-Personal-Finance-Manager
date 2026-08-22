<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

/*
|--------------------------------------------------------------------------
| Password Reset Link
|--------------------------------------------------------------------------
|
| Laravel's Password broker expects a route named "password.reset"
| when generating the standard password reset notification.
|
| We redirect that URL to the React frontend and preserve the
| reset token and email address.
|
*/

Route::get(
    '/reset-password/{token}',
    function (
        string $token,
        Request $request
    ) {
        $frontendUrl = env(
            'FRONTEND_URL',
            'http://localhost:5173'
        );

        $email = $request->query(
            'email'
        );

        $query = http_build_query([
            'token' => $token,
            'email' => $email,
        ]);

        return redirect()->away(
            "{$frontendUrl}/reset-password?{$query}"
        );
    }
)->name('password.reset');