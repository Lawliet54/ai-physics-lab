<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('employee_number', 64)->nullable();
            $table->string('specialization')->nullable();
            $table->text('qualification')->nullable();
            $table->integer('experience_years')->default(0);
            $table->text('bio')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 120);
            $table->unsignedTinyInteger('grade_level');
            $table->string('academic_year', 20);
            $table->string('subject_focus', 120)->nullable();
            $table->foreignUuid('homeroom_teacher_id')->nullable()->constrained('teacher_profiles')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['grade_level', 'academic_year']);
        });

        Schema::create('student_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('student_number', 64)->nullable();
            $table->unsignedTinyInteger('grade_level');
            $table->string('school_name')->nullable();
            $table->string('city', 120)->nullable();
            $table->date('birth_date')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone', 32)->nullable();
            $table->foreignUuid('current_class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->json('learning_preferences')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index('grade_level');
        });

        Schema::create('class_user', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('role_in_class', 32);
            $table->timestamp('joined_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['class_id', 'user_id', 'role_in_class']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_user');
        Schema::dropIfExists('student_profiles');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('teacher_profiles');
    }
};
