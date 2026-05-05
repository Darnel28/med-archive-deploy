<?php
// Migration supplémentaire optionnelle
// database/migrations/2024_01_01_000015_create_dossier_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('dossier_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers');
            $table->foreignId('document_id')->constrained('documents');
            $table->string('categorie')->default('general'); // administratif, medical, etc.
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['dossier_id', 'document_id']);
            $table->index('categorie');
        });
    }

    public function down()
    {
        Schema::dropIfExists('dossier_documents');
    }
};
