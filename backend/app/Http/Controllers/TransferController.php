<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransferRequest;
use App\Http\Resources\TransferResource;
use App\Models\Transfer;
use App\Services\TransferService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TransferController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function __construct(
        private TransferService $transferService
    ) {}

    public function index()
    {
        $this->authorize(
            'viewAny',
            Transfer::class
        );

        return $this->success(
            TransferResource::collection(
                $this->transferService->index()
            )
        );
    }

    public function store(
        TransferRequest $request
    ) {
        $this->authorize(
            'create',
            Transfer::class
        );

        $transfer =
            $this->transferService->store(
                $request->validated()
            );

        return $this->success(
            new TransferResource(
                $transfer->load([
                    'fromAccount',
                    'toAccount',
                ])
            ),
            'Transfer completed successfully.',
            201
        );
    }

    public function show(
        Transfer $transfer
    ) {
        $this->authorize(
            'view',
            $transfer
        );

        return $this->success(
            new TransferResource(
                $this->transferService->show(
                    $transfer
                )
            ),
            'Transfer retrieved successfully.'
        );
    }

    public function update(
        TransferRequest $request,
        Transfer $transfer
    ) {
        $this->authorize(
            'update',
            $transfer
        );

        $updatedTransfer =
            $this->transferService->update(
                $transfer,
                $request->validated()
            );

        return $this->success(
            new TransferResource(
                $updatedTransfer->load([
                    'fromAccount',
                    'toAccount',
                ])
            ),
            'Transfer updated successfully.'
        );
    }

    public function destroy(
        Transfer $transfer
    ) {
        $this->authorize(
            'delete',
            $transfer
        );

        $this->transferService->delete(
            $transfer
        );

        return $this->success(
            null,
            'Transfer deleted successfully.'
        );
    }
}