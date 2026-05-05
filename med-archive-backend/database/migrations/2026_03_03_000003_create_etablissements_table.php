<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('etablissements', function (Blueprint $table) {
            $table->id();

            // L'utilisateur qui représente cet établissement
            $table->foreignId('user_id')->unique()->constrained('users');

            // Informations spécifiques à l'établissement
            $table->enum('type_etablissement', ['hopital', 'clinique', 'cabinet', 'laboratoire']);
            $table->string('code_etablissement')->unique();
            $table->string('registre_commerce')->nullable();
            $table->string('directeur_nom')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('etablissements');
    }
};
