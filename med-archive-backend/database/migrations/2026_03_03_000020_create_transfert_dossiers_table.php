<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('transfert_dossiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers');
            $table->foreignId('service_source_id')->constrained('services');
            $table->foreignId('service_destination_id')->constrained('services');
            $table->foreignId('etablissement_source_id')->constrained('users');
            $table->foreignId('etablissement_destination_id')->constrained('users');
            $table->enum('statut', ['demande', 'accepte', 'refuse'])->default('demande');
            $table->text('motif')->nullable();
            $table->text('observations')->nullable();
            $table->foreignId('demandeur_id')->constrained('users');
            $table->foreignId('approbateur_id')->nullable()->constrained('users');
            $table->timestamp('date_demande');
            $table->timestamp('date_approbation')->nullable();
            $table->timestamps();

            $table->index('dossier_id');
            $table->index('statut');
            $table->index('date_demande');
        });
    }

    public function down()
    {
        Schema::dropIfExists('transfert_dossiers');
    }
};
