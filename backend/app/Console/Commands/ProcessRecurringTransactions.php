<?php

namespace App\Console\Commands;

use App\Actions\ExecuteRecurringTransaction;
use App\Models\RecurringTransaction;
use Illuminate\Console\Command;

class ProcessRecurringTransactions extends Command
{
    protected $signature = 'transactions:process-recurring';

    protected $description = 'Process all due recurring transactions';

    public function __construct(
        private ExecuteRecurringTransaction $executor
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $transactions = RecurringTransaction::where('is_active', true)
            ->whereDate('next_run_date', '<=', now())
            ->get();

        foreach ($transactions as $transaction) {

            if (
                $transaction->end_date &&
                $transaction->end_date->isPast()
            ) {
                $transaction->update([
                    'is_active' => false,
                ]);

                continue;
            }

            $this->executor->execute($transaction);
        }

        $this->info("Processed {$transactions->count()} recurring transaction(s).");

        return self::SUCCESS;
    }
}