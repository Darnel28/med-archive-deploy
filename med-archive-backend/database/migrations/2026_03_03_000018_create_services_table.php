<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('users');
            $table->string('nom');
            $table->string('description')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamps();

            $table->index('etablissement_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('services');
    }
};
