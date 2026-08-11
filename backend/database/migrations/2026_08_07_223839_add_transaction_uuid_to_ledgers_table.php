<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ledgers', function (Blueprint $table) {

            $table->uuid('transaction_uuid')
                ->nullable()
                ->after('account_id')
                ->index();

        });
    }

    public function down(): void
    {
        Schema::table('ledgers', function (Blueprint $table) {

            $table->dropColumn('transaction_uuid');

        });
    }
};