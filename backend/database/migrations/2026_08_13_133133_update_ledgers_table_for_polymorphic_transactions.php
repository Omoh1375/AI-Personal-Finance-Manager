<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ledgers', function (Blueprint $table) {
            $table->string('ledgerable_type')
                ->nullable()
                ->after('transaction_uuid');

            $table->unsignedBigInteger('ledgerable_id')
                ->nullable()
                ->after('ledgerable_type');

            $table->index(
                ['ledgerable_type', 'ledgerable_id'],
                'ledgers_ledgerable_index'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ledgers', function (Blueprint $table) {
            $table->dropIndex(
                'ledgers_ledgerable_index'
            );

            $table->dropColumn([
                'ledgerable_type',
                'ledgerable_id',
            ]);
        });
    }
};