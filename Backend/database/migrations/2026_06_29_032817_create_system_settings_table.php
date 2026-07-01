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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('gym_name')->default('My gym');
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->text('location')->nullable();
            $table->text('email')->nullable();
            $table->text('contact')->nullable();
            $table->json('social_links')->nullable();
            $table->json('gallery')->nullable();
            $table->json('features')->nullable();
            $table->json('pricing')->nullable();
            $table->string('favicon')->nullable();
            $table->string('primary_color')->default('#ef4444');
            $table->string('secondary_color')->default('#dc2626');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
