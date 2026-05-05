<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->string('numero')->unique();
            $table->foreignId('patient_id')->constrained('patients');
            $table->foreignId('consultation_id')->nullable()->constrained('consultations');
            $table->enum('type', ['consultation', 'examen', 'urgence']);
            $table->decimal('montant_total', 10, 2);
            $table->decimal('montant_paye', 10, 2)->default(0);
            $table->decimal('montant_restant', 10, 2);
            $table->enum('statut', ['non_payee', 'partiellement_payee', 'payee'])->default('non_payee');
            $table->string('methode_paiement')->nullable();
            $table->dateTime('date_paiement')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('factures');
    }
};
