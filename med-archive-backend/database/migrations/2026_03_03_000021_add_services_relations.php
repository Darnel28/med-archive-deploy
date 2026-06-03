<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Ajouter service_id à medecins
        Schema::table('medecins', function (Blueprint $table) {
            if (!Schema::hasColumn('medecins', 'service_id')) {
                $table->foreignId('service_id')->nullable()->after('specialite_id')->constrained('services');
                $table->index('service_id');
            }
        });

        // Ajouter service_id à consultations
        Schema::table('consultations', function (Blueprint $table) {
            if (!Schema::hasColumn('consultations', 'service_id')) {
                $table->foreignId('service_id')->nullable()->after('medecin_id')->constrained('services');
                $table->index('service_id');
            }
        });
    }

    public function down()
    {
        Schema::table('medecins', function (Blueprint $table) {
            if (Schema::hasColumn('medecins', 'service_id')) {
                $table->dropForeignIdFor('service_id');
                $table->dropColumn('service_id');
            }
        });

        Schema::table('consultations', function (Blueprint $table) {
            if (Schema::hasColumn('consultations', 'service_id')) {
                $table->dropForeignIdFor('service_id');
                $table->dropColumn('service_id');
            }
        });
    }
};
