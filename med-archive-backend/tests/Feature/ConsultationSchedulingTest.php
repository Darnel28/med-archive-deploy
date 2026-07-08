<?php

namespace Tests\Feature;

use App\Models\Dossier;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\Role;
use App\Models\Service;
use App\Models\Specialite;
use App\Models\TransfertDossier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConsultationSchedulingTest extends TestCase
{
    use RefreshDatabase;

    private function createMedecinForService(Service $service, string $name): Medecin
    {
        $roleMedecin = Role::firstOrCreate(['nom' => 'Medecin'], ['description' => 'Medecin']);
        $specialite = Specialite::firstOrCreate(['nom' => 'Generaliste'], ['description' => 'Generaliste']);
        $user = User::factory()->create([
            'role_id' => $roleMedecin->id,
            'name' => $name,
            'etablissement_id' => $service->etablissement_id,
        ]);

        return Medecin::create([
            'user_id' => $user->id,
            'etablissement_id' => $service->etablissement_id,
            'service_id' => $service->id,
            'specialite_id' => $specialite->id,
            'numero_professionnel' => 'MED-' . uniqid(),
        ]);
    }

    public function test_previous_doctor_cannot_schedule_appointment_after_service_transfer(): void
    {
        $roleEtablissement = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $etablissement = User::factory()->create(['role_id' => $roleEtablissement->id]);

        $sourceService = Service::create(['etablissement_id' => $etablissement->id, 'nom' => 'Neurologie', 'est_actif' => true]);
        $destinationService = Service::create(['etablissement_id' => $etablissement->id, 'nom' => 'Accueil', 'est_actif' => true]);
        $oldMedecin = $this->createMedecinForService($sourceService, 'Ancien medecin');
        $newMedecin = $this->createMedecinForService($destinationService, 'Nouveau medecin');

        $rolePatient = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);
        $patientUser = User::factory()->create(['role_id' => $rolePatient->id]);
        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'service_id' => $destinationService->id,
            'npi' => 'NPI-' . uniqid(),
            'imu' => 'IMU-' . uniqid(),
        ]);
        $dossier = Dossier::create([
            'patient_id' => $patient->id,
            'numero_dossier' => Dossier::generateNumeroDossier(),
            'medecin_referent_id' => null,
            'service_proprietaire_id' => $destinationService->id,
            'statut' => 'transfere',
            'statut_transfert' => 'accepte',
        ]);
        TransfertDossier::create([
            'dossier_id' => $dossier->id,
            'service_source_id' => $sourceService->id,
            'service_destination_id' => $destinationService->id,
            'etablissement_source_id' => $etablissement->id,
            'etablissement_destination_id' => $etablissement->id,
            'statut' => 'accepte',
            'motif' => 'Transfert',
            'demandeur_id' => $oldMedecin->user_id,
            'approbateur_id' => $etablissement->id,
            'date_demande' => now()->subHour(),
            'date_approbation' => now(),
        ]);

        $payload = [
            'patient_id' => $patient->id,
            'medecin_id' => $oldMedecin->id,
            'date_consultation' => now()->addDay()->format('Y-m-d\TH:i:s'),
            'motif' => 'Rendez-vous',
            'statut' => 'en_attente',
        ];

        $this->actingAs($oldMedecin->user, 'sanctum')
            ->postJson('/api/consultations', $payload)
            ->assertStatus(403);

        $this->actingAs($oldMedecin->user, 'sanctum')
            ->getJson("/api/medecins/{$oldMedecin->id}/patients")
            ->assertOk()
            ->assertJsonCount(0, 'data.data');

        $this->actingAs($newMedecin->user, 'sanctum')
            ->getJson("/api/medecins/{$newMedecin->id}/patients")
            ->assertOk()
            ->assertJsonCount(1, 'data.data');

        $this->actingAs($newMedecin->user, 'sanctum')
            ->postJson('/api/consultations', [...$payload, 'medecin_id' => $newMedecin->id])
            ->assertStatus(201);
    }
}
