<?php

namespace App\Services;

use App\Models\Account;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class AccountService
{
    public function index()
    {
        Gate::authorize(
            'view-any',
            Account::class
        );

        return Account::where(
            'user_id',
            Auth::id()
        )
            ->orderByDesc(
                'is_default'
            )
            ->orderBy(
                'name'
            )
            ->get();
    }

    public function store(
        array $data
    ): Account {
        $data['user_id'] =
            Auth::id();

        return Account::create(
            $data
        );
    }

    public function update(
        Account $account,
        array $data
    ): Account {
        Gate::authorize(
            'update',
            $account
        );

        $account->update(
            $data
        );

        return $account->fresh();
    }

    public function delete(
        Account $account
    ): void {
        Gate::authorize(
            'delete',
            $account
        );

        if (
            $account->is_default
        ) {
            abort(
                403,
                'Default account cannot be deleted.'
            );
        }

        $account->delete();
    }
}