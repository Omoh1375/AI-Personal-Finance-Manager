<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'amount' => $this->amount,

            'reference' => $this->reference,

            'description' => $this->description,

            'transferred_at' => $this->transferred_at,

            'from_account' => [
                'id' => $this->fromAccount?->id,
                'name' => $this->fromAccount?->name,
            ],

            'to_account' => [
                'id' => $this->toAccount?->id,
                'name' => $this->toAccount?->name,
            ],

            'created_at' => $this->created_at,
        ];
    }
}