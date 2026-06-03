<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Role;
use App\Models\User;

class MiddlewareRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_cannot_access_admin_factures_index()
    {

        $roleAdmin = Role::firstOrCreate(['nom' => 'Administrateur'], ['description' => 'Admin']);
        $rolePatient = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);

        $patientUser = User::factory()->create(['role_id' => $rolePatient->id]);

        $response = $this->actingAs($patientUser, 'sanctum')->getJson('/api/factures');
        $response->assertStatus(403);
    }
}
