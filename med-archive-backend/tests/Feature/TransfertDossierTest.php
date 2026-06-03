<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\Role;
use App\Models\User;
use App\Models\Dossier;
use App\Models\Service;
use App\Models\TransfertDossier;

class TransfertDossierTest extends TestCase
{
    use RefreshDatabase;

    public function test_medecin_can_request_transfer()
    {
        $roleMed = Role::firstOrCreate(['nom' => 'Medecin'], ['description' => 'Medecin']);
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);

        $medecin = User::factory()->create(['role_id' => $roleMed->id]);
        $etabSource = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Etab Source']);
        $etabDest = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Etab Dest']);

        $serviceSource = Service::create(['etablissement_id' => $etabSource->id, 'nom' => 'Source', 'description' => 's', 'est_actif' => true]);
        $serviceDest = Service::create(['etablissement_id' => $etabDest->id, 'nom' => 'Dest', 'description' => 'd', 'est_actif' => true]);

        $patientRole = Role::firstOrCreate(['nom'=>'Patient'], ['description'=>'Patient']);
        $patientUser = User::factory()->create(['role_id' => $patientRole->id]);
        $patient = \App\Models\Patient::create(['user_id' => $patientUser->id, 'npi' => 'NPI-100', 'imu' => 'IMU-100']);

        $dossier = Dossier::create(['patient_id' => $patient->id, 'numero_dossier' => Dossier::generateNumeroDossier()]);

        $payload = [
            'dossier_id' => $dossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => $serviceDest->id,
            'etablissement_source_id' => $etabSource->id,
            'etablissement_destination_id' => $etabDest->id,
            'demandeur_id' => $medecin->id,
            'motif' => 'Transfert test'
        ];

        $response = $this->actingAs($medecin, 'sanctum')->postJson('/api/transferts-dossiers', $payload);
        $response->assertStatus(201)->assertJsonStructure(['id', 'dossier_id', 'service_source_id', 'service_destination_id', 'motif', 'demandeur_id']);
    }
}
