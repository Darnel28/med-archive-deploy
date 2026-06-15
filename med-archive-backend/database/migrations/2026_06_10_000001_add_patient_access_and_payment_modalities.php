<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('statut');
            }

            if (!Schema::hasColumn('users', 'temporary_password_expires_at')) {
                $table->timestamp('temporary_password_expires_at')->nullable()->after('must_change_password');
            }
        });

        Schema::table('services', function (Blueprint $table) {
            if (!Schema::hasColumn('services', 'tarif_patient_simple')) {
                $table->decimal('tarif_patient_simple', 10, 2)->default(5000)->after('est_actif');
            }

            if (!Schema::hasColumn('services', 'tarif_patient_assure')) {
                $table->decimal('tarif_patient_assure', 10, 2)->default(2500)->after('tarif_patient_simple');
            }
        });

        Schema::table('laboratoires', function (Blueprint $table) {
            if (!Schema::hasColumn('laboratoires', 'tarif_patient_simple')) {
                $table->decimal('tarif_patient_simple', 10, 2)->default(10000)->after('est_actif');
            }

            if (!Schema::hasColumn('laboratoires', 'tarif_patient_assure')) {
                $table->decimal('tarif_patient_assure', 10, 2)->default(5000)->after('tarif_patient_simple');
            }
        });
    }

    public function down(): void
    {
        Schema::table('laboratoires', function (Blueprint $table) {
            foreach (['tarif_patient_simple', 'tarif_patient_assure'] as $column) {
                if (Schema::hasColumn('laboratoires', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('services', function (Blueprint $table) {
            foreach (['tarif_patient_simple', 'tarif_patient_assure'] as $column) {
                if (Schema::hasColumn('services', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            foreach (['must_change_password', 'temporary_password_expires_at'] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
