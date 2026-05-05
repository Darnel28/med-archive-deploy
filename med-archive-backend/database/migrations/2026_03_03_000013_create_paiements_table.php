<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('factures');
            $table->decimal('montant', 10, 2);
            $table->string('methode');
            $table->string('reference')->nullable();
            $table->enum('statut', ['en_attente', 'confirme', 'echoue'])->default('confirme');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('paiements');
    }
};
