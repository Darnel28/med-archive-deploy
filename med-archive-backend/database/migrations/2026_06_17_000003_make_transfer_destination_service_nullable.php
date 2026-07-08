<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transfert_dossiers', function (Blueprint $table) {
            if (Schema::hasColumn('transfert_dossiers', 'service_destination_id')) {
                $table->foreignId('service_destination_id')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('transfert_dossiers', function (Blueprint $table) {
            if (Schema::hasColumn('transfert_dossiers', 'service_destination_id')) {
                $table->foreignId('service_destination_id')->nullable(false)->change();
            }
        });
    }
};
