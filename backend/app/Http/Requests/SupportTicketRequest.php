<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupportTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'subject' => [
                'required',
                'string',
                'min:5',
                'max:150',
            ],

            'category' => [
                'required',
                'string',
                Rule::in([
                    'account',
                    'profile',
                    'transactions',
                    'budgets',
                    'savings',
                    'security',
                    'technical',
                    'other',
                ]),
            ],

            'priority' => [
                'required',
                'string',
                Rule::in([
                    'low',
                    'normal',
                    'high',
                    'urgent',
                ]),
            ],

            'message' => [
                'required',
                'string',
                'min:10',
                'max:5000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'subject.required' =>
                'Please enter a subject.',

            'subject.min' =>
                'The subject must be at least 5 characters.',

            'category.in' =>
                'Please select a valid support category.',

            'priority.in' =>
                'Please select a valid priority.',

            'message.required' =>
                'Please describe the issue you need help with.',

            'message.min' =>
                'Your message must be at least 10 characters.',

            'message.max' =>
                'Your message cannot exceed 5000 characters.',
        ];
    }
}