<?php
// database/migrations/2024_01_01_000009_create_dossiers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dossiers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->unique()->constrained('patients'); // Un patient = Un dossier

            // Identifiants
            $table->string('numero_dossier')->unique();
            $table->string('imu')->nullable(); // Identifiant Médical Unique (référence croisée)

            // Informations générales du dossier
            $table->enum('statut', ['actif', 'archive', 'transfere'])->default('actif');
            $table->date('date_ouverture')->default(now());
            $table->date('date_fermeture')->nullable();
            $table->string('medecin_traitant')->nullable(); // Médecin référent actuel

            // Résumé médical (visible rapidement)
            $table->text('diagnostics_principaux')->nullable(); // Diagnostics importants
            $table->text('traitements_en_cours')->nullable(); // Traitements actuels
            $table->text('allergies_importantes')->nullable(); // Alertes allergies
            $table->text('notes_importantes')->nullable(); // Notes générales

            // Statistiques (pour requêtes rapides)
            $table->integer('total_consultations')->default(0);
            $table->integer('total_documents')->default(0);
            $table->integer('total_analyses')->default(0);
            $table->integer('total_ordonnances')->default(0);

            // Dernières activités
            $table->timestamp('derniere_consultation')->nullable();
            $table->timestamp('dernier_document')->nullable();
            $table->timestamp('derniere_analyse')->nullable();

            $table->foreignId('etablissement_destination_id')->nullable()->constrained('etablissements');
            $table->enum('statut_transfert', ['demande', 'accepte', 'refuse'])->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Index pour recherche rapide
            $table->index('patient_id');
            $table->index('numero_dossier');
            $table->index('imu');
            $table->index('statut');
            $table->index('derniere_consultation');
        });
    }

    public function down()
    {
        Schema::dropIfExists('dossiers');
    }
};
