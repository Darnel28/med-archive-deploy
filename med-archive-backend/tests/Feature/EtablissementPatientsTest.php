<?php

namespace Tests\Feature;

use App\Models\Dossier;
use App\Models\Consultation;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\Role;
use App\Models\Specialite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EtablissementPatientsTest extends TestCase
{
    use RefreshDatabase;

    public function test_etablissement_sees_directly_attached_patients_without_service_or_consultation(): void
    {
        $roleEtablissement = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $rolePatient = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);

        $etablissement = User::factory()->create([
            'role_id' => $roleEtablissement->id,
            'name' => 'Hopital Regional de Parakou',
        ]);

        $patientUser = User::factory()->create([
            'role_id' => $rolePatient->id,
            'etablissement_id' => $etablissement->id,
            'name' => 'Patient sans service',
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'npi' => 'NPI-' . uniqid(),
            'imu' => 'IMU-' . uniqid(),
        ]);

        Dossier::create([
            'patient_id' => $patient->id,
            'numero_dossier' => Dossier::generateNumeroDossier(),
            'imu' => $patient->imu,
        ]);

        $response = $this->actingAs($etablissement, 'sanctum')
            ->getJson('/api/etablissement/mes-patients');

        $response->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.id', $patientUser->id);
    }

    public function test_etablissement_sees_patients_linked_by_seeded_consultations(): void
    {
        $roleEtablissement = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleMedecin = Role::firstOrCreate(['nom' => 'Medecin'], ['description' => 'Medecin']);
        $rolePatient = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);

        $etablissement = User::factory()->create([
            'role_id' => $roleEtablissement->id,
            'name' => 'Hopital Saint Jean de Porto-Novo',
        ]);

        $medecinUser = User::factory()->create([
            'role_id' => $roleMedecin->id,
            'etablissement_id' => $etablissement->id,
        ]);

        $specialite = Specialite::create([
            'nom' => 'Medecine Generale',
            'description' => 'Specialite de test',
        ]);

        $medecin = Medecin::create([
            'user_id' => $medecinUser->id,
            'etablissement_id' => $etablissement->id,
            'specialite_id' => $specialite->id,
            'numero_professionnel' => 'MED-BJ-TEST-001',
        ]);

        $patientUser = User::factory()->create([
            'role_id' => $rolePatient->id,
            'etablissement_id' => null,
            'name' => 'Patient relie par consultation',
        ]);

        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'npi' => 'NPI-' . uniqid(),
            'imu' => 'IMU-' . uniqid(),
        ]);

        $dossier = Dossier::create([
            'patient_id' => $patient->id,
            'numero_dossier' => Dossier::generateNumeroDossier(),
            'imu' => $patient->imu,
        ]);

        Consultation::create([
            'dossier_id' => $dossier->id,
            'medecin_id' => $medecin->id,
            'date_consultation' => now(),
            'motif' => 'Consultation seeded',
        ]);

        $response = $this->actingAs($etablissement, 'sanctum')
            ->getJson('/api/etablissement/mes-patients');

        $response->assertOk()
            ->assertJsonPath('data.total', 1)
            ->assertJsonPath('data.data.0.id', $patientUser->id);
    }
}
