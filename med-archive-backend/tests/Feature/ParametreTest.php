<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Role;
use App\Models\User;
use App\Models\Parametre;

class ParametreTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_list_parametres()
    {
        $role = Role::firstOrCreate(['nom' => 'Administrateur'], ['description' => 'Admin']);
        $user = User::factory()->create(['role_id' => $role->id]);

        $payload = ['cle' => 'site_nom', 'valeur' => 'Med Archive'];

        $create = $this->actingAs($user, 'sanctum')->postJson('/api/parametres', $payload);
        $create->assertStatus(201)->assertJsonFragment(['cle' => 'site_nom']);

        $list = $this->actingAs($user, 'sanctum')->getJson('/api/parametres');
        $list->assertStatus(200)->assertJsonStructure(['data']);
    }
}
