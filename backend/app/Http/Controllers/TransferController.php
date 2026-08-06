<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransferRequest;
use App\Http\Resources\TransferResource;
use App\Models\Transfer;
use App\Services\TransferService;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;

class TransferController extends Controller
{
    use ApiResponse;

    public function __construct(
        private TransferService $transferService
    ) {}

    public function index()
    {
        return $this->success(
            TransferResource::collection(
                $this->transferService->index()
            )
        );
    }

    public function store(TransferRequest $request)
    {
        $transfer = $this->transferService->store(
            $request->validated()
        );

        return $this->success(
            new TransferResource($transfer),
            'Transfer completed successfully.',
            201
        );
    }

    public function show(Transfer $transfer)
    {
        abort_if(
            $transfer->user_id !== Auth::id(),
            403
        );

        return $this->success(
            new TransferResource(
                $transfer->load([
                    'fromAccount',
                    'toAccount'
                ])
            )
        );
    }

    public function destroy(Transfer $transfer)
    {
        $this->transferService->delete($transfer);

        return $this->success(
            null,
            'Transfer deleted successfully.'
        );
    }
}