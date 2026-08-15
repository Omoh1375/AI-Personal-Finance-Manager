<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SavingsGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => [
                'required',
                'exists:accounts,id',
            ],

            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'target_amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'target_date' => [
                'required',
                'date',
            ],

            'description' => [
                'nullable',
                'string',
                'max:500',
            ],

            'is_completed' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}