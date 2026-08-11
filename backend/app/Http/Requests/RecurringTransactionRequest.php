<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecurringTransactionRequest extends FormRequest
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

            'type' => [
                'required',
                'in:income,expense',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'frequency' => [
                'required',
                'in:daily,weekly,monthly,yearly',
            ],

            'start_date' => [
                'required',
                'date',
            ],

            'end_date' => [
                'nullable',
                'date',
                'after_or_equal:start_date',
            ],

            'next_run_date' => [
                'required',
                'date',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ];
    }
}