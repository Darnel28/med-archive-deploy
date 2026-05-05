<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers');
            $table->foreignId('medecin_id')->constrained('medecins');
            $table->dateTime('date_consultation');
            $table->string('motif');
            $table->text('diagnostic')->nullable();
            $table->text('observations')->nullable();
            $table->enum('statut_paiement', ['non_payee', 'payee'])->default('non_payee');
            $table->decimal('montant_consultation', 10, 2)->nullable();
            $table->boolean('est_urgence')->default(false);
            $table->timestamps();

            $table->index('dossier_id');
            $table->index('medecin_id');
            $table->index('date_consultation');
        });
    }

    public function down()
    {
        Schema::dropIfExists('consultations');
    }
};
