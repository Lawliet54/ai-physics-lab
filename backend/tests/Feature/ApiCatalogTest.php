<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalog_endpoints_return_seeded_physics_content(): void
    {
        $this->seed();

        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->getJson('/api/theories')
            ->assertOk()
            ->assertJsonCount(12, 'data')
            ->assertJsonPath('data.0.code', 'TH-01');

        $this->getJson('/api/tasks')
            ->assertOk()
            ->assertJsonCount(9, 'data');

        $this->getJson('/api/labs')
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_ai_chat_returns_local_physics_answer(): void
    {
        $this->postJson('/api/ai/chat', ['message' => 'Ом заңын түсіндір'])
            ->assertOk()
            ->assertJsonPath('data.role', 'assistant')
            ->assertJsonPath('data.source', 'local-physics-kb');
    }
}
