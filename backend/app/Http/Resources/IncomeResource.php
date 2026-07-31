<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'amount' => $this->amount,

            'reference' => $this->reference,

            'description' => $this->description,

            'received_at' => $this->received_at,

            'account' => new AccountResource($this->whenLoaded('account')),

            'category' => new CategoryResource($this->whenLoaded('category')),

            'created_at' => $this->created_at,
        ];
    }
}