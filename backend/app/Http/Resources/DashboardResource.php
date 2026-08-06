<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [

            'summary' => [
                'total_balance' => $this['total_balance'],
                'total_income' => $this['total_income'],
                'total_expenses' => $this['total_expenses'],
                'monthly_income' => $this['monthly_income'],
                'monthly_expenses' => $this['monthly_expenses'],
            ],

            'accounts' => $this['accounts'],

            'recent_transactions' => $this['recent_transactions'],

            'expense_breakdown' => $this['expense_breakdown'],

            'monthly_cash_flow' => $this['monthly_cash_flow'],

            'savings_rate' => $this['savings_rate'],

            'top_spending_categories' => $this['top_spending_categories'],

            'account_analytics' => $this['account_analytics'],

        ];
    }
}