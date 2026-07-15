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
        Schema::create('walk_in_attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('walk_in_id')
                  ->nullable()
                  ->constrained('walk_in_info')
                  ->onDelete('cascade');
            $table->foreignId('members_id')
                  ->nullable()
                  ->constrained('members')
                  ->onDelete('cascade');
            $table->datetime('time_in');
            $table->decimal('fee_paid', 10, 2);
            $table->decimal('total_amount', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('walk_in_attendance');
    }
};
