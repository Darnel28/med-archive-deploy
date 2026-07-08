<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            if (!Schema::hasColumn('dossiers', 'medecin_referent_id')) {
                $table->foreignId('medecin_referent_id')->nullable()->after('medecin_traitant')->constrained('medecins')->nullOnDelete();
                $table->index('medecin_referent_id');
            }

            if (!Schema::hasColumn('dossiers', 'service_proprietaire_id')) {
                $table->foreignId('service_proprietaire_id')->nullable()->after('medecin_referent_id')->constrained('services')->nullOnDelete();
                $table->index('service_proprietaire_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            foreach (['service_proprietaire_id', 'medecin_referent_id'] as $column) {
                if (Schema::hasColumn('dossiers', $column)) {
                    $table->dropForeign([$column]);
                    $table->dropIndex([$column]);
                    $table->dropColumn($column);
                }
            }
        });
    }
};
