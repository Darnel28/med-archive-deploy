<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transfert_dossiers', function (Blueprint $table) {
            if (Schema::hasColumn('transfert_dossiers', 'medecin_referent_destination_id')) {
                $table->dropForeign(['medecin_referent_destination_id']);
                $table->dropIndex(['medecin_referent_destination_id']);
                $table->dropColumn('medecin_referent_destination_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('transfert_dossiers', function (Blueprint $table) {
            if (!Schema::hasColumn('transfert_dossiers', 'medecin_referent_destination_id')) {
                $table->foreignId('medecin_referent_destination_id')->nullable()->after('service_destination_id')->constrained('medecins')->nullOnDelete();
                $table->index('medecin_referent_destination_id');
            }
        });
    }
};
