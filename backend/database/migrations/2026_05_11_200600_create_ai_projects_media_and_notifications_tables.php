<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignUuid('topic_id')->nullable()->constrained('topics')->nullOnDelete();
            $table->string('title')->nullable();
            $table->string('context_type', 50)->nullable();
            $table->uuid('context_ref_id')->nullable();
            $table->string('model_name', 120)->nullable();
            $table->string('system_prompt_version', 80)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
            $table->string('sender_role', 20);
            $table->text('content');
            $table->json('content_json')->nullable();
            $table->integer('token_usage_input')->nullable();
            $table->integer('token_usage_output')->nullable();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('topic_id')->constrained('topics')->cascadeOnDelete();
            $table->string('title_kz');
            $table->text('description')->nullable();
            $table->text('instructions')->nullable();
            $table->string('difficulty', 32)->default('intermediate');
            $table->decimal('max_score', 8, 2)->default(0);
            $table->timestamp('due_at')->nullable();
            $table->boolean('is_published')->default(false);
            $table->json('metadata')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('media_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('original_name');
            $table->string('mime_type', 120);
            $table->string('extension', 20)->nullable();
            $table->string('disk', 50)->default('public');
            $table->text('path');
            $table->bigInteger('file_size_bytes')->default(0);
            $table->string('checksum_sha256', 128)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('notification_type', 80);
            $table->string('title_kz');
            $table->text('body_text')->nullable();
            $table->json('payload')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('media_files');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_conversations');
    }
};
