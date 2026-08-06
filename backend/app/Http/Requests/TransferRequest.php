<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'from_account_id' => [
                'required',
                'exists:accounts,id',
                'different:to_account_id',
            ],

            'to_account_id' => [
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

            'transferred_at' => [
                'required',
                'date',
            ],

        ];
    }
}