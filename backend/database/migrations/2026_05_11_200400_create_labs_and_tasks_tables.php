<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->string('slug', 160)->unique();
            $table->string('title_kz');
            $table->text('description')->nullable();
            $table->string('difficulty', 32)->default('basic');
            $table->integer('estimated_minutes')->nullable();
            $table->string('simulation_type', 80)->nullable();
            $table->json('config')->nullable();
            $table->boolean('is_published')->default(false);
            $table->integer('version')->default(1);
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['topic_id', 'is_published']);
        });

        Schema::create('lab_parameters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lab_id')->constrained('labs')->cascadeOnDelete();
            $table->string('key', 120);
            $table->string('label_kz');
            $table->string('data_type', 50);
            $table->string('unit', 50)->nullable();
            $table->decimal('min_value', 18, 6)->nullable();
            $table->decimal('max_value', 18, 6)->nullable();
            $table->decimal('step_value', 18, 6)->nullable();
            $table->json('default_value')->nullable();
            $table->json('options')->nullable();
            $table->json('validation_rules')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['lab_id', 'key']);
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('task_type', 50);
            $table->string('code', 80)->unique();
            $table->string('title_kz');
            $table->text('instruction')->nullable();
            $table->text('explanation')->nullable();
            $table->string('difficulty', 32)->default('basic');
            $table->unsignedTinyInteger('grade_level')->nullable();
            $table->integer('estimated_minutes')->nullable();
            $table->integer('points')->default(0);
            $table->boolean('is_published')->default(false);
            $table->boolean('is_adaptive')->default(false);
            $table->json('content_json')->nullable();
            $table->json('metadata')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->index(['task_type', 'is_published']);
            $table->index(['difficulty', 'grade_level']);
        });

        Schema::create('task_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->string('variant_code', 80);
            $table->text('prompt_text')->nullable();
            $table->json('prompt_json')->nullable();
            $table->json('answer_schema')->nullable();
            $table->json('randomization_rules')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['task_id', 'variant_code']);
        });

        Schema::create('task_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_variant_id')->constrained('task_variants')->cascadeOnDelete();
            $table->string('option_key', 80);
            $table->text('label_kz');
            $table->json('value_json')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->integer('sort_order')->default(0);
            $table->text('feedback_text')->nullable();
            $table->timestamps();
            $table->unique(['task_variant_id', 'option_key']);
        });

        Schema::create('task_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_variant_id')->constrained('task_variants')->cascadeOnDelete();
            $table->string('answer_key', 80)->nullable();
            $table->text('answer_text')->nullable();
            $table->json('answer_json')->nullable();
            $table->decimal('tolerance', 18, 6)->nullable();
            $table->boolean('case_sensitive')->default(false);
            $table->decimal('score_weight', 8, 2)->default(1);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('task_topic_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignUuid('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->string('relation_type', 50)->default('primary');
            $table->timestamps();
            $table->unique(['task_id', 'topic_id', 'relation_type']);
        });

        Schema::create('theory_task_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('theory_id')->constrained('theories')->cascadeOnDelete();
            $table->foreignUuid('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->string('relation_type', 50)->default('practice');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theory_task_links');
        Schema::dropIfExists('task_topic_links');
        Schema::dropIfExists('task_answers');
        Schema::dropIfExists('task_options');
        Schema::dropIfExists('task_variants');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('lab_parameters');
        Schema::dropIfExists('labs');
    }
};
