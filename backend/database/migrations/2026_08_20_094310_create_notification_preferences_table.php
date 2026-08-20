<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();

            $table->boolean('email_notifications')
                ->default(true);

            $table->boolean('financial_activity')
                ->default(true);

            $table->boolean('budget_alerts')
                ->default(true);

            $table->boolean('savings_alerts')
                ->default(true);

            /*
             * Security emails are intentionally always enabled.
             */
            $table->boolean('security_alerts')
                ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'notification_preferences'
        );
    }
};