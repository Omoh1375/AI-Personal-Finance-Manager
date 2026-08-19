<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
            ],

            'email' => [
                'required',
                'email',
                'max:255',

                Rule::unique('users', 'email')
                    ->ignore(
                        $this->user()->id
                    ),
            ],

            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],

            'bio' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'country' => [
                'nullable',
                'string',
                'max:100',
            ],

            'address' => [
                'nullable',
                'string',
                'max:255',
            ],

            'date_of_birth' => [
                'nullable',
                'date',
                'before:today',
            ],
        ];
    }
}