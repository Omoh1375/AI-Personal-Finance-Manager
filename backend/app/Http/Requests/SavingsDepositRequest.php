<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SavingsDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'savings_goal_id' => [
                'required',
                'exists:savings_goals,id',
            ],

            'account_id' => [
                'required',
                'exists:accounts,id',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'reference' => [
                'nullable',
                'string',
                'max:100',
            ],

            'description' => [
                'nullable',
                'string',
                'max:500',
            ],

            'deposited_at' => [
                'required',
                'date',
            ],

        ];
    }
}