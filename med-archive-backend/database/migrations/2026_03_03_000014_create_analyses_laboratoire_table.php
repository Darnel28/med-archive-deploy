<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('analyses_laboratoire', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations');
            $table->foreignId('laboratoire_id')->constrained('laboratoires');
            $table->foreignId('prescripteur_id')->constrained('medecins');
            $table->string('type_analyse');
            $table->json('resultats')->nullable();
            $table->date('date_prelevement');
            $table->date('date_resultat')->nullable();
            $table->enum('statut', ['prescrit', 'preleve', 'en_cours', 'termine'])->default('prescrit');
            $table->text('commentaires')->nullable();
            $table->string('fichier_resultat')->nullable();
            $table->enum('statut_paiement', ['non_payee', 'payee'])->default('non_payee');
            $table->decimal('montant_analyse', 10, 2)->nullable();
            $table->foreignId('facture_id')->nullable()->constrained('factures');
            $table->timestamps();

            $table->index('consultation_id');
            $table->index('laboratoire_id');
            $table->index('statut');
        });
    }

    public function down()
    {
        Schema::dropIfExists('analyses_laboratoire');
    }
};
