<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('constantes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations');
            $table->string('tension_arterielle')->nullable();
            $table->decimal('temperature', 4, 2)->nullable();
            $table->decimal('poids', 5, 2)->nullable();
            $table->integer('taille')->nullable();
            $table->integer('frequence_cardiaque')->nullable();
            $table->decimal('glycemie', 5, 2)->nullable();
            $table->decimal('saturation_oxygene', 5, 2)->nullable();
            $table->timestamps();

            $table->index('consultation_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('constantes');
    }
};
