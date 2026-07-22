<?php

namespace Tests\Feature;

use App\Models\Dossier;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\Role;
use App\Models\Service;
use App\Models\Specialite;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientChatContactsTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_contact_the_doctor_service_and_hospital_of_its_active_service(): void
    {
        $hospitalRole = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etablissement']);
        $serviceRole = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);
        $doctorRole = Role::firstOrCreate(['nom' => 'Medecin'], ['description' => 'Medecin']);
        $patientRole = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);

        $hospital = User::factory()->create(['role_id' => $hospitalRole->id]);
        $serviceUser = User::factory()->create(['role_id' => $serviceRole->id, 'etablissement_id' => $hospital->id]);
        $service = Service::create([
            'user_id' => $serviceUser->id,
            'etablissement_id' => $hospital->id,
            'nom' => 'Cardiologie',
            'description' => 'Service de test',
            'est_actif' => true,
        ]);
        $doctorUser = User::factory()->create(['role_id' => $doctorRole->id, 'etablissement_id' => $hospital->id]);
        $doctor = Medecin::create([
            'user_id' => $doctorUser->id,
            'etablissement_id' => $hospital->id,
            'service_id' => $service->id,
            'specialite_id' => Specialite::create(['nom' => 'Cardiologie', 'description' => 'Test'])->id,
            'numero_professionnel' => 'MED-TEST-001',
        ]);
        $patientUser = User::factory()->create(['role_id' => $patientRole->id]);
        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'service_id' => $service->id,
            'npi' => 'NPI-CHAT-TEST',
            'imu' => 'IMU-CHAT-TEST',
        ]);
        Dossier::create([
            'patient_id' => $patient->id,
            'numero_dossier' => Dossier::generateNumeroDossier(),
            'service_proprietaire_id' => $service->id,
        ]);

        $response = $this->actingAs($patientUser, 'sanctum')->getJson('/api/chat/contacts');

        $response->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonFragment(['id' => $doctorUser->id])
            ->assertJsonFragment(['id' => $serviceUser->id])
            ->assertJsonFragment(['id' => $hospital->id]);

        $this->actingAs($patientUser, 'sanctum')
            ->postJson("/api/chat/messages/{$doctorUser->id}", ['body' => 'Bonjour docteur'])
            ->assertCreated();
    }
}
