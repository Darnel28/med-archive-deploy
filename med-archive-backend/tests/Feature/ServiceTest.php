<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Role;
use App\Models\User;
use App\Models\Service;

class ServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_services()
    {
        $role = Role::firstOrCreate(['nom' => 'Administrateur'], ['description' => 'Admin']);
        $user = User::factory()->create(['role_id' => $role->id]);

        // create an etablissement for the service
        $etabRole = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $etab = User::factory()->create(['role_id' => $etabRole->id, 'name' => 'Etablissement Test']);

        Service::create([
            'etablissement_id' => $etab->id,
            'nom' => 'Cardiologie',
            'description' => 'Service test',
            'est_actif' => true
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/services');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data']);
    }
}
