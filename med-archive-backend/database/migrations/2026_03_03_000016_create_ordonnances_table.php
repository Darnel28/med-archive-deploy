<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('ordonnances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations');
            $table->json('medicaments');
            $table->text('posologie')->nullable();
            $table->text('instructions')->nullable();
            $table->date('date_validite')->nullable();
            $table->boolean('est_executee')->default(false);
            $table->timestamps();

            $table->index('consultation_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('ordonnances');
    }
};
