<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthProvisioningTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_create_user_accounts(): void
    {
        $this->seed();

        $login = $this->postJson('/api/auth/login', [
            'login' => 'admin',
            'password' => 'admin12345',
        ])->assertOk();

        $token = $login->json('data.token');

        $this->withToken($token)
            ->postJson('/api/admin/users', [
                'name' => 'Test Student',
                'username' => 'student01',
                'role' => 'student',
            ])
            ->assertCreated()
            ->assertJsonPath('data.user.username', 'student01')
            ->assertJsonPath('data.user.roles.0', 'student')
            ->assertJsonStructure(['data' => ['temporary_password']]);
    }

    public function test_non_admin_cannot_create_users(): void
    {
        $this->seed();

        $login = $this->postJson('/api/auth/login', [
            'login' => 'teacher',
            'password' => 'teacher12345',
        ])->assertOk();

        $this->withToken($login->json('data.token'))
            ->postJson('/api/admin/users', [
                'name' => 'Blocked Student',
                'username' => 'blocked01',
                'role' => 'student',
            ])
            ->assertForbidden();
    }
}
