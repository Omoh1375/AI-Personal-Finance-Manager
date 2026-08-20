<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupportTicketRequest;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SupportTicketController extends Controller
{
    use ApiResponse;

    /**
     * List the authenticated user's tickets.
     */
    public function index(
        Request $request
    ): JsonResponse {
        $tickets = $request
            ->user()
            ->supportTickets()
            ->latest()
            ->get();

        return $this->success(
            SupportTicketResource::collection(
                $tickets
            ),
            'Support tickets retrieved successfully.'
        );
    }

    /**
     * Create a new support ticket.
     */
    public function store(
        SupportTicketRequest $request
    ): JsonResponse {
        $user = $request->user();

        $ticket = SupportTicket::create([
            'user_id' =>
                $user->id,

            'ticket_number' =>
                $this->generateTicketNumber(),

            'subject' =>
                $request->subject,

            'category' =>
                $request->category,

            'priority' =>
                $request->priority,

            'message' =>
                $request->message,

            'status' =>
                'open',
        ]);

        return $this->success(
            new SupportTicketResource(
                $ticket
            ),
            'Your support request has been submitted successfully.',
            201
        );
    }

    /**
     * Show one ticket belonging to the authenticated user.
     */
    public function show(
        Request $request,
        SupportTicket $supportTicket
    ): JsonResponse {
        if (
            $supportTicket->user_id !==
            $request->user()->id
        ) {
            return $this->error(
                'You are not authorized to view this support ticket.',
                null,
                403
            );
        }

        return $this->success(
            new SupportTicketResource(
                $supportTicket
            ),
            'Support ticket retrieved successfully.'
        );
    }

    /**
     * Generate a unique human-readable ticket number.
     */
    private function generateTicketNumber(): string
    {
        do {
            $ticketNumber =
                'SUP-' .
                now()->format('Ymd') .
                '-' .
                strtoupper(
                    Str::random(6)
                );
        } while (
            SupportTicket::where(
                'ticket_number',
                $ticketNumber
            )->exists()
        );

        return $ticketNumber;
    }
}