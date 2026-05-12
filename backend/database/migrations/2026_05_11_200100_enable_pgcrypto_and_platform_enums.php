<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Enums are stored as strings so the app works on SQLite locally and PostgreSQL later.
    }

    public function down(): void
    {
        //
    }
};
