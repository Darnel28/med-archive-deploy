<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('laboratoires', function (Blueprint $table) {
            $table->id();

            // L'utilisateur qui est laborantin
            $table->foreignId('user_id')->unique()->constrained('users');

            // L'établissement (user) auquel il appartient
            $table->foreignId('etablissement_id')->constrained('users');

            // Infos du laboratoire
            $table->string('nom_laboratoire');
            $table->string('agrement')->unique();
            $table->json('specialites_analyse')->nullable();
            $table->boolean('est_actif')->default(true);

            $table->timestamps();

            $table->index('etablissement_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('laboratoires');
    }
};
