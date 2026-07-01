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
        Schema::create('membership_fee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('members_id')->constrained('members')->onDelete('cascade');
            $table->foreignId('membership_id')->constrained('membership_pricing')->onDelete('cascade');
            $table->enum('payment_type', ['cash', 'gcash']);
            $table->decimal('payment_amount', 10, 2)->nullable();
            $table->string('or_number')->nullable();
            $table->string('transaction_id')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_fee');
    }
};
