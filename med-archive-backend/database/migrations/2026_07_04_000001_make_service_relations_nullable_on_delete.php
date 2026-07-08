<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medecins', function (Blueprint $table) {
            if (Schema::hasColumn('medecins', 'service_id')) {
                $table->dropForeign(['service_id']);
                $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();
            }
        });

        Schema::table('consultations', function (Blueprint $table) {
            if (Schema::hasColumn('consultations', 'service_id')) {
                $table->dropForeign(['service_id']);
                $table->foreign('service_id')->references('id')->on('services')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('medecins', function (Blueprint $table) {
            if (Schema::hasColumn('medecins', 'service_id')) {
                $table->dropForeign(['service_id']);
                $table->foreign('service_id')->references('id')->on('services');
            }
        });

        Schema::table('consultations', function (Blueprint $table) {
            if (Schema::hasColumn('consultations', 'service_id')) {
                $table->dropForeign(['service_id']);
                $table->foreign('service_id')->references('id')->on('services');
            }
        });
    }
};
