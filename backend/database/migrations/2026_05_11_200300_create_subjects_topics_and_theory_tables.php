<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 50)->unique();
            $table->string('name_kz');
            $table->string('name_ru')->nullable();
            $table->string('name_en')->nullable();
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('grade_from')->nullable();
            $table->unsignedTinyInteger('grade_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('topics', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignUuid('parent_topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->string('slug', 160)->unique();
            $table->string('title_kz');
            $table->string('title_ru')->nullable();
            $table->string('title_en')->nullable();
            $table->text('summary')->nullable();
            $table->string('difficulty', 32)->default('basic');
            $table->unsignedTinyInteger('grade_level')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_published')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['subject_id', 'is_published']);
        });

        Schema::create('topic_sections', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->string('section_key', 120);
            $table->string('title_kz');
            $table->text('content')->nullable();
            $table->integer('sort_order')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['topic_id', 'section_key']);
        });

        Schema::create('theories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->string('slug', 160)->unique();
            $table->string('code', 80)->unique()->nullable();
            $table->string('title_kz');
            $table->text('intro_text')->nullable();
            $table->string('formula')->nullable();
            $table->integer('estimated_minutes')->nullable();
            $table->string('difficulty', 32)->default('basic');
            $table->boolean('is_published')->default(false);
            $table->integer('version')->default(1);
            $table->json('metadata')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['topic_id', 'is_published']);
        });

        Schema::create('theory_blocks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('theory_id')->constrained('theories')->cascadeOnDelete();
            $table->string('block_type', 50);
            $table->string('title_kz')->nullable();
            $table->text('content')->nullable();
            $table->json('content_json')->nullable();
            $table->integer('sort_order')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('theory_formulae', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('theory_id')->constrained('theories')->cascadeOnDelete();
            $table->string('name_kz');
            $table->text('formula_latex');
            $table->text('description')->nullable();
            $table->json('variables')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('theory_formulae');
        Schema::dropIfExists('theory_blocks');
        Schema::dropIfExists('theories');
        Schema::dropIfExists('topic_sections');
        Schema::dropIfExists('topics');
        Schema::dropIfExists('subjects');
    }
};
