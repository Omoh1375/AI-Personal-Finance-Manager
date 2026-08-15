<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavingsGoalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'] ?? $this->id,

            'name' => $this->resource['name'] ?? $this->name,

            'target_amount' => (float) (
                $this->resource['target_amount']
                ?? $this->target_amount
                ?? 0
            ),

            'saved' => (float) (
                $this->resource['saved']
                ?? 0
            ),

            'remaining' => (float) (
                $this->resource['remaining']
                ?? 0
            ),

            'progress' => (float) (
                $this->resource['progress']
                ?? 0
            ),

            'status' =>
                $this->resource['status']
                ?? null,

            'target_date' =>
                $this->resource['target_date']
                ?? $this->target_date
                ?? null,

            'description' =>
                $this->resource['description']
                ?? $this->description
                ?? null,

            'account' =>
                $this->resource['account']
                ?? $this->account?->name
                ?? null,
        ];
    }
}