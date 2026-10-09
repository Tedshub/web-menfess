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
        Schema::create('pesan', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 30);
            $table->string('isi_pesan', 200);
            $table->boolean('disetujui')->default(true);
            $table->string('sidik_perangkat', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['disetujui', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pesan');
    }
};
