<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IncomeRequest extends FormRequest
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

            'category_id' => [
                'required',
                'exists:categories,id',
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

            'received_at' => [
                'required',
                'date',
            ],
        ];
    }
}