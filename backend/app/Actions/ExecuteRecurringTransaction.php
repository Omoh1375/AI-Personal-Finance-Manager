<?php

namespace App\Actions;

use App\Models\RecurringTransaction;
use App\Services\ExpenseService;
use App\Services\IncomeService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ExecuteRecurringTransaction
{
    public function __construct(
        private IncomeService $incomeService,
        private ExpenseService $expenseService
    ) {}

    public function execute(
        RecurringTransaction $transaction
    ): void {

        DB::transaction(function () use ($transaction) {

            $payload = [

                'account_id' => $transaction->account_id,

                'category_id' => $transaction->category_id,

                'amount' => $transaction->amount,

                'description' => $transaction->description,

            ];

            if ($transaction->type === 'income') {

                $payload['received_at'] = now();

                $this->incomeService->create(
                $payload
            );

            } else {

                $payload['spent_at'] = now();

               $this->expenseService->create(
                $payload
            );

            }

            $transaction->update([

                'next_run_date' => $this->nextDate(
                    $transaction
                ),

            ]);

        });
    }

    private function nextDate(
        RecurringTransaction $transaction
    ): Carbon {

        return match ($transaction->frequency) {

            'daily' => Carbon::parse(
                $transaction->next_run_date
            )->addDay(),

            'weekly' => Carbon::parse(
                $transaction->next_run_date
            )->addWeek(),

            'monthly' => Carbon::parse(
                $transaction->next_run_date
            )->addMonth(),

            'yearly' => Carbon::parse(
                $transaction->next_run_date
            )->addYear(),

        };

    }
}