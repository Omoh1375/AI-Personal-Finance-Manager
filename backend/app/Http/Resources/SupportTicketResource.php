<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketResource extends JsonResource
{
    public function toArray(
        Request $request
    ): array {
        return [
            'id' =>
                $this->id,

            'ticket_number' =>
                $this->ticket_number,

            'subject' =>
                $this->subject,

            'category' =>
                $this->category,

            'priority' =>
                $this->priority,

            'message' =>
                $this->message,

            'status' =>
                $this->status,

            'admin_response' =>
                $this->admin_response,

            'responded_at' =>
                $this->responded_at,

            'created_at' =>
                $this->created_at,

            'updated_at' =>
                $this->updated_at,
        ];
    }
}