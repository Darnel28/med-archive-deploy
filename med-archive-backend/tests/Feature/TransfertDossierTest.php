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

    private function makePatientWithDossier(?Service $service = null): array
    {
        $patientRole = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);
        $patientUser = User::factory()->create(['role_id' => $patientRole->id]);
        $patient = \App\Models\Patient::create([
            'user_id' => $patientUser->id,
            'service_id' => $service?->id,
            'npi' => 'NPI-' . uniqid(),
            'imu' => 'IMU-' . uniqid(),
        ]);

        $dossier = Dossier::create([
            'patient_id' => $patient->id,
            'numero_dossier' => Dossier::generateNumeroDossier(),
            'service_proprietaire_id' => $service?->id,
        ]);

        return [$patient, $dossier];
    }

    public function test_service_can_request_transfer_to_another_service()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $etabSource = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Etab Source']);
        $sourceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etabSource->id]);

        $serviceSource = Service::create(['user_id' => $sourceUser->id, 'etablissement_id' => $etabSource->id, 'nom' => 'Source', 'description' => 's', 'est_actif' => true]);
        $serviceDest = Service::create(['etablissement_id' => $etabSource->id, 'nom' => 'Dest', 'description' => 'd', 'est_actif' => true]);

        [, $dossier] = $this->makePatientWithDossier($serviceSource);

        $payload = [
            'dossier_id' => $dossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => $serviceDest->id,
            'etablissement_source_id' => $etabSource->id,
            'etablissement_destination_id' => $etabSource->id,
            'motif' => 'Transfert test'
        ];

        $response = $this->actingAs($sourceUser, 'sanctum')->postJson('/api/transferts-dossiers', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.service_destination_id', $serviceDest->id)
            ->assertJsonPath('data.demandeur_id', $sourceUser->id);
    }

    public function test_destination_service_can_accept_legacy_transfer_without_destination_service()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $etab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Etab']);
        $sourceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etab->id]);
        $destinationUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etab->id]);

        $serviceSource = Service::create(['user_id' => $sourceUser->id, 'etablissement_id' => $etab->id, 'nom' => 'Neurologie', 'description' => 's', 'est_actif' => true]);
        $serviceDestination = Service::create(['user_id' => $destinationUser->id, 'etablissement_id' => $etab->id, 'nom' => 'Accueil', 'description' => 'd', 'est_actif' => true]);

        [$patient, $dossier] = $this->makePatientWithDossier($serviceSource);

        $transfert = TransfertDossier::create([
            'dossier_id' => $dossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => null,
            'etablissement_source_id' => $etab->id,
            'etablissement_destination_id' => $etab->id,
            'statut' => 'demande',
            'motif' => 'Transfert test',
            'demandeur_id' => $sourceUser->id,
            'date_demande' => now(),
        ]);

        $response = $this->actingAs($destinationUser, 'sanctum')
            ->putJson("/api/transferts-dossiers/{$transfert->id}", ['statut' => 'accepte']);

        $response->assertOk()
            ->assertJsonPath('data.statut', 'accepte')
            ->assertJsonPath('data.service_destination_id', $serviceDestination->id);

        $this->assertDatabaseHas('patients', ['id' => $patient->id, 'service_id' => $serviceDestination->id]);
        $this->assertDatabaseHas('dossiers', ['id' => $dossier->id, 'service_proprietaire_id' => $serviceDestination->id]);
    }

    public function test_service_patient_list_includes_transferred_dossier_owner()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $etab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Etab']);
        $serviceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etab->id]);
        $service = Service::create(['user_id' => $serviceUser->id, 'etablissement_id' => $etab->id, 'nom' => 'Accueil', 'description' => 'd', 'est_actif' => true]);

        [$patient, $dossier] = $this->makePatientWithDossier();
        $dossier->update([
            'statut' => 'transfere',
            'statut_transfert' => 'accepte',
            'service_proprietaire_id' => $service->id,
        ]);

        $response = $this->actingAs($serviceUser, 'sanctum')
            ->getJson('/api/services/mes-patients');

        $response->assertOk()
            ->assertJsonPath('data.data.0.id', $patient->id)
            ->assertJsonPath('data.data.0.dossier.statut', 'transfere');
    }
}
