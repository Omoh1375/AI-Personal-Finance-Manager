<?php

namespace App\Http\Controllers;

use App\Http\Requests\StatementRequest;
use App\Http\Resources\StatementResource;
use App\Services\StatementService;
use App\Traits\ApiResponse;

class StatementController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StatementService $statementService
    ) {}

    public function index(
        StatementRequest $request
    )
    {
        return $this->success(

            new StatementResource(

                $this->statementService->generate(

                    $request->integer('account_id'),

                    $request->string('from')->toString(),

                    $request->string('to')->toString()

                )

            )

        );
    }
}