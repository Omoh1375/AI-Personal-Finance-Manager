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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->enum('type', [
                'cash',
                'bank',
                'credit_card',
                'mobile_wallet',
                'crypto'
            ]);

            $table->decimal('balance', 15, 2)->default(0);

            $table->string('currency', 3)->default('NGN');

            $table->string('icon')->nullable();

            $table->string('color')->default('#3B82F6');

            $table->boolean('is_default')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
