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

    public function test_destination_hospital_can_accept_transfer_without_destination_service_by_assigning_one()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $sourceEtab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Source Etab']);
        $destinationEtab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Destination Etab']);
        $sourceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $sourceEtab->id]);
        $destinationUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $destinationEtab->id]);

        $serviceSource = Service::create(['user_id' => $sourceUser->id, 'etablissement_id' => $sourceEtab->id, 'nom' => 'Neurologie', 'description' => 's', 'est_actif' => true]);
        $serviceDestination = Service::create(['user_id' => $destinationUser->id, 'etablissement_id' => $destinationEtab->id, 'nom' => 'Accueil', 'description' => 'd', 'est_actif' => true]);

        [$patient, $dossier] = $this->makePatientWithDossier($serviceSource);

        $transfert = TransfertDossier::create([
            'dossier_id' => $dossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => null,
            'etablissement_source_id' => $sourceEtab->id,
            'etablissement_destination_id' => $destinationEtab->id,
            'statut' => 'demande',
            'motif' => 'Transfert test',
            'demandeur_id' => $sourceUser->id,
            'date_demande' => now(),
        ]);

        $response = $this->actingAs($destinationEtab, 'sanctum')
            ->putJson("/api/transferts-dossiers/{$transfert->id}", [
                'statut' => 'accepte',
                'service_destination_id' => $serviceDestination->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.statut', 'accepte')
            ->assertJsonPath('data.service_destination_id', $serviceDestination->id);

        $this->assertDatabaseHas('patients', ['id' => $patient->id, 'service_id' => $serviceDestination->id]);
        $this->assertDatabaseHas('dossiers', ['id' => $dossier->id, 'service_proprietaire_id' => $serviceDestination->id]);
    }

    public function test_hospital_transfer_list_excludes_internal_service_transfers()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $etab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Etab']);
        $otherEtab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Other Etab']);
        $sourceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etab->id]);

        $serviceSource = Service::create(['user_id' => $sourceUser->id, 'etablissement_id' => $etab->id, 'nom' => 'Neurologie', 'description' => 's', 'est_actif' => true]);
        $serviceDestination = Service::create(['etablissement_id' => $etab->id, 'nom' => 'Accueil', 'description' => 'd', 'est_actif' => true]);
        $otherService = Service::create(['etablissement_id' => $otherEtab->id, 'nom' => 'Urgences', 'description' => 'u', 'est_actif' => true]);

        [, $internalDossier] = $this->makePatientWithDossier($serviceSource);
        [, $externalDossier] = $this->makePatientWithDossier($serviceSource);

        TransfertDossier::create([
            'dossier_id' => $internalDossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => $serviceDestination->id,
            'etablissement_source_id' => $etab->id,
            'etablissement_destination_id' => $etab->id,
            'statut' => 'demande',
            'motif' => 'Interne',
            'demandeur_id' => $sourceUser->id,
            'date_demande' => now(),
        ]);

        $externalTransfer = TransfertDossier::create([
            'dossier_id' => $externalDossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => $otherService->id,
            'etablissement_source_id' => $etab->id,
            'etablissement_destination_id' => $otherEtab->id,
            'statut' => 'demande',
            'motif' => 'Externe',
            'demandeur_id' => $sourceUser->id,
            'date_demande' => now(),
        ]);

        $response = $this->actingAs($etab, 'sanctum')
            ->getJson('/api/transferts-dossiers?inter_etablissement=1');

        $response->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.id', $externalTransfer->id);
    }

    public function test_service_transfer_list_excludes_hospital_unassigned_transfers()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $etab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Etab']);
        $sourceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etab->id]);
        $destinationUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etab->id]);

        $serviceSource = Service::create(['user_id' => $sourceUser->id, 'etablissement_id' => $etab->id, 'nom' => 'Neurologie', 'description' => 's', 'est_actif' => true]);
        Service::create(['user_id' => $destinationUser->id, 'etablissement_id' => $etab->id, 'nom' => 'Accueil', 'description' => 'd', 'est_actif' => true]);

        [, $dossier] = $this->makePatientWithDossier($serviceSource);

        TransfertDossier::create([
            'dossier_id' => $dossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => null,
            'etablissement_source_id' => $etab->id,
            'etablissement_destination_id' => $etab->id,
            'statut' => 'demande',
            'motif' => 'A affecter par hopital',
            'demandeur_id' => $sourceUser->id,
            'date_demande' => now(),
        ]);

        $response = $this->actingAs($destinationUser, 'sanctum')
            ->getJson('/api/transferts-dossiers');

        $response->assertOk()
            ->assertJsonCount(0, 'data.data');
    }

    public function test_service_transfer_list_excludes_inter_hospital_transfers(): void
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $sourceEtab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'CHU']);
        $destinationEtab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Hopital destination']);
        $sourceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $sourceEtab->id]);
        $destinationUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $destinationEtab->id]);
        $serviceSource = Service::create(['user_id' => $sourceUser->id, 'etablissement_id' => $sourceEtab->id, 'nom' => 'Medecine generale', 'description' => 's', 'est_actif' => true]);
        $serviceDestination = Service::create(['user_id' => $destinationUser->id, 'etablissement_id' => $destinationEtab->id, 'nom' => 'Accueil', 'description' => 'd', 'est_actif' => true]);
        [, $dossier] = $this->makePatientWithDossier($serviceSource);

        TransfertDossier::create([
            'dossier_id' => $dossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => $serviceDestination->id,
            'etablissement_source_id' => $sourceEtab->id,
            'etablissement_destination_id' => $destinationEtab->id,
            'statut' => 'demande',
            'motif' => 'Transfert vers un autre hopital',
            'demandeur_id' => $sourceEtab->id,
            'date_demande' => now(),
        ]);

        $this->actingAs($sourceUser, 'sanctum')
            ->getJson('/api/transferts-dossiers')
            ->assertOk()
            ->assertJsonCount(0, 'data.data');

        $this->actingAs($sourceEtab, 'sanctum')
            ->getJson('/api/transferts-dossiers?inter_etablissement=1')
            ->assertOk()
            ->assertJsonCount(1, 'data.data');
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

    public function test_source_hospital_patient_list_keeps_patient_after_external_transfer()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);

        $sourceEtab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Source Etab']);
        $destinationEtab = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Destination Etab']);
        $sourceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $sourceEtab->id]);
        $destinationUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $destinationEtab->id]);

        $serviceSource = Service::create(['user_id' => $sourceUser->id, 'etablissement_id' => $sourceEtab->id, 'nom' => 'Medecine generale', 'description' => 's', 'est_actif' => true]);
        $serviceDestination = Service::create(['user_id' => $destinationUser->id, 'etablissement_id' => $destinationEtab->id, 'nom' => 'Cardiologie', 'description' => 'd', 'est_actif' => true]);

        [$patient, $dossier] = $this->makePatientWithDossier($serviceSource);

        TransfertDossier::create([
            'dossier_id' => $dossier->id,
            'service_source_id' => $serviceSource->id,
            'service_destination_id' => $serviceDestination->id,
            'etablissement_source_id' => $sourceEtab->id,
            'etablissement_destination_id' => $destinationEtab->id,
            'statut' => 'accepte',
            'motif' => 'Transfert externe',
            'demandeur_id' => $sourceUser->id,
            'approbateur_id' => $destinationEtab->id,
            'date_demande' => now(),
            'date_approbation' => now(),
        ]);

        $dossier->update([
            'statut' => 'transfere',
            'statut_transfert' => 'accepte',
            'service_proprietaire_id' => $serviceDestination->id,
        ]);
        $patient->update(['service_id' => $serviceDestination->id]);

        $response = $this->actingAs($sourceEtab, 'sanctum')
            ->getJson('/api/etablissement/mes-patients');

        $response->assertOk()
            ->assertJsonPath('data.data.0.id', $patient->user_id)
            ->assertJsonPath('data.data.0.patient.dossier.statut', 'transfere');
    }

    public function test_hospital_patient_list_excludes_unrelated_patients()
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);

        $hospital = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Hospital']);
        $otherHospital = User::factory()->create(['role_id' => $roleEtab->id, 'name' => 'Other Hospital']);
        $otherService = Service::create(['etablissement_id' => $otherHospital->id, 'nom' => 'Other Service', 'description' => 'd', 'est_actif' => true]);

        [, $unrelatedDossier] = $this->makePatientWithDossier($otherService);

        $response = $this->actingAs($hospital, 'sanctum')
            ->getJson('/api/etablissement/mes-patients');

        $response->assertOk()
            ->assertJsonCount(0, 'data.data');

        $this->assertNotEquals($hospital->id, $unrelatedDossier->serviceProprietaire?->etablissement_id);
    }
}
