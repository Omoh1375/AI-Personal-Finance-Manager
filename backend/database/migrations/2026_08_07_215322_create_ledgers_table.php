<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledgers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('account_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->uuid('transaction_uuid')
                ->nullable();

            $table->string('ledgerable_type')
                ->nullable();

            $table->unsignedBigInteger('ledgerable_id')
                ->nullable();

            $table->enum('type', [
                'income',
                'expense',
                'transfer_in',
                'transfer_out',
                'saving',
                'refund',
                'adjustment',
            ]);

            $table->decimal('amount', 15, 2);

            $table->decimal('balance_after', 15, 2);

            $table->string('reference')
                ->nullable();

            $table->text('description')
                ->nullable();

            $table->timestamp('transaction_date')
                ->useCurrent();

            $table->timestamps();

            $table->index(
                ['ledgerable_type', 'ledgerable_id'],
                'ledgers_ledgerable_index'
            );

            $table->index(
                'transaction_uuid',
                'ledgers_transaction_uuid_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledgers');
    }
};