<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'balance' => $this->balance,
            'currency' => $this->currency,
            'icon' => $this->icon,
            'color' => $this->color,
            'is_default' => $this->is_default,
            'created_at' => $this->created_at,
        ];
    }
}