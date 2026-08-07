<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavingsDepositResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'amount' => (float) $this->amount,

            'reference' => $this->reference,

            'description' => $this->description,

            'deposited_at' => $this->deposited_at,

            'account' => [
                'id' => $this->account?->id,
                'name' => $this->account?->name,
            ],

            'goal' => [
                'id' => $this->savingsGoal?->id,
                'name' => $this->savingsGoal?->name,
            ],

            'created_at' => $this->created_at,

        ];
    }
}