<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedecinController;
use App\Http\Controllers\SpecialiteController;
use App\Http\Controllers\DossierController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\EtablissementController;
use App\Http\Controllers\LaboratoireController;
use App\Http\Controllers\AnalyseController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\StatistiqueController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\PatientMedecinController;
use App\Http\Controllers\ParametreController;
use App\Http\Controllers\TransfertDossierController;
use App\Models\Role;

Route::get('/ping', function() {
    return response()->json(['message' => 'pong']);
});

// Routes publiques
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/specialites', [SpecialiteController::class, 'index']);
Route::get('/patients-medecins', [PatientMedecinController::class, 'index']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/me/mot-de-passe', [AuthController::class, 'changerMotDePasse']);

    // Users
    Route::get('/roles', function () {
        return response()->json([
            'success' => true,
            'data' => Role::orderBy('nom')->get()
        ]);
    });
    Route::apiResource('users', UserController::class);
    Route::post('/users/{id}/desactiver', [UserController::class, 'desactiver']);
    Route::post('/users/{id}/activer', [UserController::class, 'activer']);
    Route::get('/statistiques/utilisateurs', [UserController::class, 'statistiques']);

    // Patients
    Route::get('/patients/me/consultations', [PatientController::class, 'mesConsultations']);
    Route::get('/patients/me/ordonnances', [PatientController::class, 'mesOrdonnances']);
    Route::get('/patients/me/analyses', [PatientController::class, 'mesAnalyses']);
    Route::get('/patients/me/factures', [PatientController::class, 'mesFactures']);
    Route::apiResource('patients', PatientController::class);
    Route::get('/patients/{id}/dossier-complet', [PatientController::class, 'dossierComplet']);
    Route::get('/statistiques/patients', [PatientController::class, 'statistiques']);

    // Médecins
    Route::apiResource('medecins', MedecinController::class);
    Route::get('/medecins/{id}/planning', [MedecinController::class, 'planning']);
    Route::get('/medecins/{id}/patients', [MedecinController::class, 'patients']);

    // Dossiers
    Route::apiResource('dossiers', DossierController::class);
    Route::get('/dossiers/{id}/resume', [DossierController::class, 'resume']);
    Route::post('/dossiers/{id}/archiver', [DossierController::class, 'archiver']);
    Route::post('/dossiers/{id}/transferer', [DossierController::class, 'transferer']);

    // Consultations
    Route::apiResource('consultations', ConsultationController::class);
    Route::post('/consultations/{id}/constantes', [ConsultationController::class, 'ajouterConstantes']);
    Route::get('/statistiques/consultations', [ConsultationController::class, 'statistiques']);
    

    // Établissements
    Route::prefix('etablissement')->group(function () {
        Route::get('/mes-donnees', [EtablissementController::class, 'mesDonnees']);
        Route::get('/mes-medecins', [EtablissementController::class, 'mesMedecins']);
        Route::get('/mes-patients', [EtablissementController::class, 'mesPatients']);
        Route::get('/mes-consultations', [EtablissementController::class, 'mesConsultations']);
        Route::get('/statistiques', [EtablissementController::class, 'statistiques']);
        Route::get('/dashboard', [EtablissementController::class, 'dashboard']);
        Route::put('/info', [EtablissementController::class, 'updateInfo']);
    });

    // Laboratoires
    Route::apiResource('laboratoires', LaboratoireController::class);
    Route::get('/laboratoires/{id}/analyses-en-attente', [LaboratoireController::class, 'analysesEnAttente']);
    Route::get('/laboratoires/{id}/statistiques', [LaboratoireController::class, 'statistiques']);

    // Services
    Route::get('/services/mes-patients', [ServiceController::class, 'mesPatients']);
    Route::apiResource('services', ServiceController::class);

    // Paramètres
    Route::apiResource('parametres', ParametreController::class);

    // Transferts de dossiers
    Route::apiResource('transferts-dossiers', TransfertDossierController::class);

    // Analyses
    Route::apiResource('analyses', AnalyseController::class);
    Route::patch('/analyses/{id}/statut', [AnalyseController::class, 'updateStatut']);
    Route::post('/analyses/{id}/resultats', [AnalyseController::class, 'ajouterResultats']);
    Route::get('/statistiques/analyses', [AnalyseController::class, 'statistiques']);

    // Documents
    Route::apiResource('documents', DocumentController::class);
    Route::get('/documents/{id}/download', [DocumentController::class, 'download']);
    Route::get('/documents/{id}/view', [DocumentController::class, 'view']);
    Route::get('/statistiques/documents', [DocumentController::class, 'statistiques']);

    // Statistiques globales
    Route::prefix('statistiques')->group(function () {
        Route::get('/dashboard', [StatistiqueController::class, 'dashboard']);
        Route::get('/avancees', [StatistiqueController::class, 'avancees']);
    });

    // Factures
    Route::prefix('factures')->group(function () {
        Route::get('/', [FactureController::class, 'index'])->middleware('role:Administrateur');
        Route::post('/', [FactureController::class, 'store'])->middleware('role:Administrateur');
        Route::get('/{id}', [FactureController::class, 'show'])->middleware('role:Administrateur,Patient');
        Route::post('/{id}/paiement', [FactureController::class, 'payer'])->middleware('role:Administrateur,Patient');
        Route::post('/{id}/stripe-intent', [FactureController::class, 'creerPaiementStripe'])->middleware('role:Administrateur,Patient');
        Route::get('/{id}/pdf', [FactureController::class, 'pdf'])->middleware('role:Administrateur,Patient');
        Route::post( '/{id}/fedapay', [FactureController::class, 'creerPaiementFedapay'])->middleware('role:Administrateur,Patient');
    });

    // Paiements
    Route::get('/paiements', [PaiementController::class, 'index'])->middleware('role:Administrateur');
    Route::get('/paiements/{id}', [PaiementController::class, 'show'])->middleware('role:Administrateur');

    // QR Code et IMU
    Route::get('/patients/imu/{imu}', [PatientController::class, 'showByImu'])->middleware('auth:sanctum');
    Route::get('/patients/{id}/qrcode', [PatientController::class, 'generateQrCode'])->middleware('auth:sanctum');

    // Transfert de dossier
    Route::patch('/dossiers/{id}/transferer', [DossierController::class, 'transferer'])->middleware('role:Medecin,Administrateur');
});
