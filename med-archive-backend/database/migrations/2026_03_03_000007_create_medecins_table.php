<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('medecins', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->unique()->constrained('users');

            $table->foreignId('etablissement_id')->constrained('users');

            $table->foreignId('specialite_id')->constrained('specialites');
            $table->string('numero_professionnel')->unique();
            $table->string('diplome')->nullable();
            $table->integer('annees_experience')->default(0);

            $table->timestamps();

            // Index
            $table->index('etablissement_id');
            $table->index('specialite_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('medecins');
    }
};
