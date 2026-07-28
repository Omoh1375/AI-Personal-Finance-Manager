<?php

namespace App\Services;

use App\Models\Account;

class AccountService
{
    public function index()
    {
        return Account::where('user_id', auth()->user()->id)
            ->orderByDesc('is_default')
            ->orderBy('name')
            ->get();
    }

    public function store(array $data): Account
    {
        $data['user_id'] = auth()->user()->id;

        return Account::create($data);
    }

    public function update(Account $account, array $data): Account
    {
        abort_if($account->user_id !== auth()->user()->id, 403);

        $account->update($data);

        return $account;
    }

    public function delete(Account $account): void
    {
        abort_if($account->user_id !== auth()->user()->id, 403);

        if ($account->is_default) {
            abort(403, 'Default account cannot be deleted.');
        }

        $account->delete();
    }
}