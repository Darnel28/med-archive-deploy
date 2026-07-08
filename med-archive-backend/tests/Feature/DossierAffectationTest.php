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

class DossierAffectationTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_affectation_creates_consultation_invoice_with_service_tariff(): void
    {
        $roleEtab = Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Etab']);
        $roleService = Role::firstOrCreate(['nom' => 'Service'], ['description' => 'Service']);
        $roleMedecin = Role::firstOrCreate(['nom' => 'Medecin'], ['description' => 'Medecin']);
        $rolePatient = Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient']);

        $etab = User::factory()->create(['role_id' => $roleEtab->id]);
        $serviceUser = User::factory()->create(['role_id' => $roleService->id, 'etablissement_id' => $etab->id]);
        $service = Service::create([
            'user_id' => $serviceUser->id,
            'etablissement_id' => $etab->id,
            'nom' => 'Medecine generale',
            'description' => 'Consultations generales',
            'est_actif' => true,
            'tarif_patient_simple' => 5000,
            'tarif_patient_assure' => 2500,
        ]);

        $specialite = Specialite::create(['nom' => 'Generaliste', 'description' => 'Medecine generale']);
        $medecinUser = User::factory()->create(['role_id' => $roleMedecin->id, 'etablissement_id' => $etab->id]);
        $medecin = Medecin::create([
            'user_id' => $medecinUser->id,
            'etablissement_id' => $etab->id,
            'service_id' => $service->id,
            'specialite_id' => $specialite->id,
            'numero_professionnel' => 'MED-001',
        ]);

        $patientUser = User::factory()->create(['role_id' => $rolePatient->id]);
        $patient = Patient::create([
            'user_id' => $patientUser->id,
            'service_id' => $service->id,
            'npi' => 'NPI-' . uniqid(),
            'imu' => 'IMU-' . uniqid(),
        ]);
        $dossier = Dossier::create([
            'patient_id' => $patient->id,
            'numero_dossier' => Dossier::generateNumeroDossier(),
            'service_proprietaire_id' => $service->id,
        ]);

        $response = $this->actingAs($serviceUser, 'sanctum')->postJson("/api/dossiers/{$dossier->id}/affecter-medecin", [
            'medecin_id' => $medecin->id,
            'date_consultation' => now()->addDay()->toISOString(),
            'motif' => 'Controle',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.consultation.montant_consultation', '5000.00')
            ->assertJsonPath('data.consultation.facture.montant_total', 5000);

        $this->assertDatabaseHas('factures', [
            'patient_id' => $patient->id,
            'type' => 'consultation',
            'montant_total' => 5000,
            'montant_restant' => 5000,
            'statut' => 'non_payee',
        ]);
    }
}
