<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_id')->constrained('labs')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->string('status', 32)->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->json('input_snapshot')->nullable();
            $table->json('output_snapshot')->nullable();
            $table->decimal('score', 8, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('lab_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_attempt_id')->constrained('lab_attempts')->cascadeOnDelete();
            $table->string('event_type', 80);
            $table->timestamp('event_time')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        Schema::create('task_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignUuid('task_variant_id')->nullable()->constrained('task_variants')->nullOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->string('status', 32)->default('pending');
            $table->integer('attempt_number')->default(1);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->integer('duration_seconds')->nullable();
            $table->decimal('score', 8, 2)->nullable();
            $table->decimal('max_score', 8, 2)->nullable();
            $table->boolean('is_correct')->nullable();
            $table->boolean('used_hint')->default(false);
            $table->foreignUuid('source_lab_attempt_id')->nullable()->constrained('lab_attempts')->nullOnDelete();
            $table->json('response_snapshot')->nullable();
            $table->text('feedback_summary')->nullable();
            $table->foreignUuid('evaluator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('task_attempt_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_attempt_id')->constrained('task_attempts')->cascadeOnDelete();
            $table->string('answer_key', 80)->nullable();
            $table->text('answer_text')->nullable();
            $table->json('answer_json')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->decimal('awarded_score', 8, 2)->default(0);
            $table->text('feedback_text')->nullable();
            $table->timestamps();
        });

        Schema::create('progress_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignUuid('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->foreignUuid('theory_id')->nullable()->constrained('theories')->nullOnDelete();
            $table->foreignUuid('lab_id')->nullable()->constrained('labs')->nullOnDelete();
            $table->foreignUuid('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->string('progress_type', 80);
            $table->string('status', 32)->default('pending');
            $table->decimal('progress_percent', 5, 2)->default(0);
            $table->decimal('score', 8, 2)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->foreignUuid('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->foreignUuid('theory_id')->nullable()->constrained('theories')->nullOnDelete();
            $table->foreignUuid('lab_id')->nullable()->constrained('labs')->nullOnDelete();
            $table->string('recommendation_type', 80);
            $table->smallInteger('priority')->default(0);
            $table->text('reason')->nullable();
            $table->json('payload')->nullable();
            $table->boolean('is_seen')->default(false);
            $table->boolean('is_accepted')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
        Schema::dropIfExists('progress_records');
        Schema::dropIfExists('task_attempt_answers');
        Schema::dropIfExists('task_attempts');
        Schema::dropIfExists('lab_events');
        Schema::dropIfExists('lab_attempts');
    }
};
