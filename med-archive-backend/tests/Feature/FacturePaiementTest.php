<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Role;
use App\Models\User;
use App\Models\Patient;
use App\Models\Facture;

class FacturePaiementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_and_patient_can_view_and_pay()
    {
        $roleAdmin = Role::firstOrCreate(['nom' => 'Administrateur'], ['description' => 'Admin']);
        $rolePatient = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);

        $admin = User::factory()->create(['role_id' => $roleAdmin->id]);
        $patientUser = User::factory()->create(['role_id' => $rolePatient->id]);
        $patient = Patient::create(['user_id' => $patientUser->id, 'npi' => 'NPI-1', 'imu' => 'IMU-1']);

        $payload = ['patient_id' => $patient->id, 'type' => 'consultation', 'montant_total' => 10000];

        $create = $this->actingAs($admin, 'sanctum')->postJson('/api/factures', $payload);
        $create->assertStatus(201)->assertJson(['success' => true]);

        $factureId = $create->json('data.id');

        $view = $this->actingAs($patientUser, 'sanctum')->getJson('/api/factures/' . $factureId);
        $view->assertStatus(200)->assertJson(['success' => true]);

        $pay = $this->actingAs($patientUser, 'sanctum')->postJson('/api/factures/' . $factureId . '/paiement', ['montant' => 5000, 'methode' => 'especes']);
        $pay->assertStatus(200)->assertJson(['success' => true]);
    }
}
