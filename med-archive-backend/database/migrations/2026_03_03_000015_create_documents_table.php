<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('consultation_id')->constrained('consultations');
            $table->foreignId('type_document_id')->constrained('type_documents');
            $table->string('titre');
            $table->string('chemin_fichier');
            $table->string('mime_type')->nullable();
            $table->integer('taille')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('consultation_id');
            $table->index('type_document_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};
