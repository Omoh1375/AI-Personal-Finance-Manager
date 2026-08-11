<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecurringTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'title' => $this->title,

            'type' => $this->type,

            'amount' => (float) $this->amount,

            'frequency' => $this->frequency,

            'start_date' => $this->start_date,

            'end_date' => $this->end_date,

            'next_run_date' => $this->next_run_date,

            'is_active' => $this->is_active,

            'account' => $this->account,

            'category' => $this->category,

            'description' => $this->description,

            'created_at' => $this->created_at,
        ];
    }
}