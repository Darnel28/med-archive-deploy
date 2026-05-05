<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('telephone')->nullable();
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->date('date_naissance')->nullable();
            $table->enum('sexe', ['M', 'F'])->nullable();

            // Le rôle détermine ce que l'utilisateur peut faire
            $table->foreignId('role_id')->constrained('roles');

            $table->foreignId('etablissement_id')->nullable()->constrained('users');

            $table->enum('statut', ['actif', 'inactif', 'en_attente'])->default('en_attente');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            // Index pour performances
            $table->index('role_id');
            $table->index('etablissement_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
