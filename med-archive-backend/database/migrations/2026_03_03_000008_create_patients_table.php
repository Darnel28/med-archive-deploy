<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();

            // L'utilisateur qui est patient
            $table->foreignId('user_id')->unique()->constrained('users');

            // Identifiants uniques du patient
            $table->string('npi')->unique(); // Numéro de Professionnel de Santé (Bénin)
            $table->string('imu')->unique(); // Identifiant Médical Unique National (Bénin)

            // Informations médicales
            $table->string('groupe_sanguin')->nullable();
            $table->text('allergies')->nullable();
            $table->text('antecedents_medicaux')->nullable();

            // Contact d'urgence
            $table->string('personne_contact')->nullable();
            $table->string('telephone_contact')->nullable();

            // Informations complémentaires
            $table->string('profession')->nullable();
            $table->string('nationalite')->default('Béninoise');
            $table->string('lieu_naissance')->nullable();

            $table->timestamps();

            // Index pour les recherches
            $table->index('imu');
        });
    }

    public function down()
    {
        Schema::dropIfExists('patients');
    }
};
