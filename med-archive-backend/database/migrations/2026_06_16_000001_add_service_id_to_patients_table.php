<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'service_id')) {
                $table->foreignId('service_id')->nullable()->after('user_id')->constrained('services')->nullOnDelete();
                $table->index('service_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (Schema::hasColumn('patients', 'service_id')) {
                $table->dropForeign(['service_id']);
                $table->dropIndex(['service_id']);
                $table->dropColumn('service_id');
            }
        });
    }
};
