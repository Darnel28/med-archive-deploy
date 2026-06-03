# 📋 ANALYSE COMPLÈTE DES MANQUES - Med-Archive Backend

## Vue d'ensemble
Après une analyse exhaustive du code, des migrations, des modèles et des controllers, voici **TOUT ce qui manque** pour que le backend soit parfaitement conforme à la fiche technique.

---

## 🔴 **1. MIGRATIONS MANQUANTES**

### ✅ À créer :

#### 1.1 Migration: `create_factures_table`
**Contexte** : Section 8.1 & 9 de la fiche technique - "Processus de consultation" et "Gestion des paiements"
- Numéro de facture unique
- Montant total, montant payé, montant restant
- Statut (non_payée, payée, remboursée)
- Type de facturation (consultation, examen, urgence)
- Date de paiement
- Méthode de paiement (Mobile Money, espèces)
- Clé étrangère patient_id
- Clé étrangère consultation_id (nullable, pour les examens)
- Clé étrangère user_id (pour l'agent de caisse) - NOTE: role "Agent d'accueil / caisse" supprimé

#### 1.2 Migration: `create_paiements_table`
**Contexte** : Gestion des transactions
- Montant versé
- Méthode (Mobile Money, espèces)
- Référence transaction
- Statut (en_attente, confirmé, échoué)
- Clé étrangère facture_id
- Clé étrangère user_id (agent de caisse) - NOTE: role supprimé
- Timestamp du paiement

#### 1.3 Migration: `create_qr_codes_table`
**Contexte** : Section 3.1 & 8.1 - "scan du QR code ou IMU"
- Clé étrangère patient_id
- Données QR encodées (JSON)
- Clé unique QR
- Valide/Invalide
- Dernière utilisation

#### 1.4 Migration: `create_notifications_table`
**Contexte** : Notifications aux patients et médecins (résultats d'analyse, etc.)
- Clé étrangère user_id (destinataire)
- Type de notification (enum)
- Titre et contenu
- Données JSON (contexte)
- Lu/Non lu
- Date d'envoi

#### 1.5 Migration: `create_audit_logs_table`
**Contexte** : Section 7 - "Journalisation des accès (audit)"
- Clé étrangère user_id (qui a effectué l'action)
- Action (enum: create, read, update, delete, etc.)
- Model et ID de la ressource
- Ancien/Nouveau contenu JSON
- Adresse IP
- User Agent (navigateur)
- Timestamp

#### 1.6 Migration: `create_transferts_dossiers_table`
**Contexte** : Section 8.3 - "Processus de transfert entre hôpitaux"
- Clé étrangère dossier_id
- Hôpital source (user_id)
- Hôpital destination (user_id)
- Statut (demandé, accepté, refusé, réalisé)
- Raison du transfert
- Motif médical
- Date du transfert
- Timestamps

#### 1.7 Migration: `create_emergences_table`
**Contexte** : Section 8.4 - "Processus d'urgence"
- Clé étrangère patient_id
- Clé étrangère medecin_id
- Établissement (user_id)
- Niveau de sévérité (critique, grave, urgent)
- Informations vitales exposées (groupe sanguin, allergies JSON)
- Statut (actif, stabilisé, référé)
- Paiement reporté (boolean)
- Timestamp activation

#### 1.8 Migration: `create_ordonnances_table` - AMÉLIORATION
**Contexte** : Section 6.3 - "Prescription électronique"
- Ajouter des champs manquants:
  - `durée_traitement` (jours)
  - `statut` (prescrite, acceptée, refusée, exécutée)
  - `notes_pharmacien` (nullable)

#### 1.9 Migration: `create_permissions_table`
**Contexte** : Section 7 - "Gestion des rôles (RBAC)"
- ID, nom, description, timestamps

#### 1.10 Migration: `create_role_permission_table`
**Contexte** : RBAC avancé
- role_id (FK)
- permission_id (FK)

#### 1.11 Migration: `create_constantes_table` - VÉRIFICATION
- Devrait contenir: tension_arterielle, température, poids, taille, fréquence_cardiaque, glycémie, saturation_oxygène

#### 1.12 Migration: `create_specialites_agents_table` (OPTIONAL)
**Contexte** : Section 3.1 - "Agent d'accueil / caisse"
- Types d'agents
- Compétences

---

## 🔴 **2. MODÈLES MANQUANTS**

### ✅ À créer :

#### 2.1 Model: `Facture`
```php
// Attributes
- numero_facture (unique)
- montant_total, montant_payé, montant_restant
- statut (enum)
- type_facturation (enum)
- date_paiement
- methode_paiement
- Relationships
  - patient() -> Patient
  - consultation() -> Consultation (nullable)
  - user() -> User (agent caisse)
  - paiements() -> Paiement (HasMany)
```

#### 2.2 Model: `Paiement`
```php
// Attributes
- montant_versé
- methode
- reference_transaction
- statut
- Relationships
  - facture() -> Facture
  - user() -> User
```

#### 2.3 Model: `QRCode`
```php
// Attributes
- qr_unique
- donnees (JSON)
- valide (boolean)
- derniere_utilisation
- Relationships
  - patient() -> Patient
```

#### 2.4 Model: `Notification`
```php
// Attributes
- type
- titre
- contenu
- donnees (JSON)
- lu (boolean)
- Relationships
  - user() -> User
```

#### 2.5 Model: `AuditLog`
```php
// Attributes
- action
- auditable_type (Polymorphic)
- auditable_id
- ancien_contenu (JSON)
- nouveau_contenu (JSON)
- ip_address
- user_agent
- Relationships
  - user() -> User
  - auditable() -> polymorphic
```

#### 2.6 Model: `TransfertDossier`
```php
// Attributes
- statut (enum)
- raison
- motif_medical
- date_transfert
- Relationships
  - dossier() -> Dossier
  - hopital_source() -> User
  - hopital_destination() -> User
```

#### 2.7 Model: `Urgence`
```php
// Attributes
- niveau_sévérité (enum)
- informations_vitales (JSON)
- statut (enum)
- paiement_reporté (boolean)
- Relationships
  - patient() -> Patient
  - medecin() -> Medecin
  - etablissement() -> User
```

#### 2.8 Model: `Permission`
```php
// Attributes
- nom (unique)
- description
- Relationships
  - roles() -> Role (BelongsToMany)
```

---

## 🔴 **3. CONTROLLERS MANQUANTS**

### ✅ À créer :

#### 3.1 Controller: `FactureController`
Routes à implémenter:
- `GET /facturas` - lister les factures (avec filtres: statut, date, patient)
- `GET /facturas/{id}` - détails d'une facture
- `POST /facturas` - créer une facture (pour consultation ou examen)
- `PATCH /facturas/{id}/statut` - mettre à jour le statut
- `GET /facturas/{id}/pdf` - télécharger PDF
- `GET /statistiques/facturas` - statistiques financières

#### 3.2 Controller: `PaiementController`
Routes à implémenter:
- `POST /paiements` - enregistrer un paiement
- `GET /paiements` - lister les paiements
- `PATCH /paiements/{id}/confirmer` - confirmer paiement Mobile Money
- `GET /paiements/{id}/statut` - vérifier le statut
- `GET /statistiques/paiements` - statistiques de paiement

#### 3.3 Controller: `QRCodeController`
Routes à implémenter:
- `POST /qrcodes/generer` - générer un QR pour un patient
- `POST /qrcodes/scanner` - traiter un scan (retourne le patient)
- `GET /qrcodes/{patient_id}` - récupérer le QR du patient
- `PATCH /qrcodes/{id}/invalider` - invalider un QR

#### 3.4 Controller: `NotificationController`
Routes à implémenter:
- `GET /notifications` - lister les notifications de l'utilisateur courant
- `PATCH /notifications/{id}/marquer-lu` - marquer comme lu
- `DELETE /notifications/{id}` - supprimer
- `GET /notifications/non-lues` - compter les non-lues

#### 3.5 Controller: `AuditController`
Routes à implémenter:
- `GET /audits` - lister tous les logs (admin seulement)
- `GET /audits/{id}` - détails d'un log
- `GET /audits/filtrés?user_id=&action=&type=` - recherche avancée
- `GET /statistiques/audits` - rapport d'audit

#### 3.6 Controller: `TransfertController`
Routes à implémenter:
- `POST /transferts` - demander un transfert
- `GET /transferts` - lister les transferts
- `PATCH /transferts/{id}/accepter` - accepter le transfert (établissement destination)
- `PATCH /transferts/{id}/refuser` - refuser
- `PATCH /transferts/{id}/realiser` - marquer comme réalisé
- `GET /dossiers/{id}/historique-transferts` - historique

#### 3.7 Controller: `UrgenceController`
Routes à implémenter:
- `POST /urgences/activer` - activer le mode urgence
- `GET /urgences/{patient_id}` - récupérer infos vitales urgence
- `PATCH /urgences/{id}/stabilisé` - marquer comme stabilisé
- `GET /urgences/en-cours` - lister les urgences actives

---

## 🔴 **4. ROUTES MANQUANTES**

### ✅ À ajouter dans `routes/api.php` :

```php
// FACTURES & PAIEMENTS
Route::prefix('facturas')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [FactureController::class, 'index']);
    Route::post('/', [FactureController::class, 'store']);
    Route::get('/{id}', [FactureController::class, 'show']);
    Route::patch('/{id}/statut', [FactureController::class, 'updateStatut']);
    Route::get('/{id}/pdf', [FactureController::class, 'generatePDF']);
    Route::get('/statistiques', [FactureController::class, 'statistiques']);
});

Route::prefix('paiements')->middleware('auth:sanctum')->group(function () {
    Route::post('/', [PaiementController::class, 'store']);
    Route::get('/', [PaiementController::class, 'index']);
    Route::patch('/{id}/confirmer', [PaiementController::class, 'confirmer']);
    Route::get('/{id}/statut', [PaiementController::class, 'checkStatut']);
    Route::get('/statistiques', [PaiementController::class, 'statistiques']);
});

// QR CODES
Route::prefix('qrcodes')->middleware('auth:sanctum')->group(function () {
    Route::post('/generer', [QRCodeController::class, 'generer']);
    Route::post('/scanner', [QRCodeController::class, 'scanner']);
    Route::get('/{patient_id}', [QRCodeController::class, 'show']);
    Route::patch('/{id}/invalider', [QRCodeController::class, 'invalider']);
});

// NOTIFICATIONS
Route::prefix('notifications')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::patch('/{id}/marquer-lu', [NotificationController::class, 'marquerLu']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
    Route::get('/non-lues/count', [NotificationController::class, 'nonLuesCount']);
});

// AUDIT
Route::prefix('audits')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [AuditController::class, 'index'])->middleware('role:Super Admin');
    Route::get('/{id}', [AuditController::class, 'show']);
    Route::get('/filtres', [AuditController::class, 'filtrer']);
});

// TRANSFERTS
Route::prefix('transferts')->middleware('auth:sanctum')->group(function () {
    Route::post('/', [TransfertController::class, 'store']);
    Route::get('/', [TransfertController::class, 'index']);
    Route::patch('/{id}/accepter', [TransfertController::class, 'accepter']);
    Route::patch('/{id}/refuser', [TransfertController::class, 'refuser']);
    Route::patch('/{id}/realiser', [TransfertController::class, 'realiser']);
});

// URGENCES
Route::prefix('urgences')->middleware('auth:sanctum')->group(function () {
    Route::post('/activer', [UrgenceController::class, 'activer']);
    Route::get('/{patient_id}', [UrgenceController::class, 'show']);
    Route::patch('/{id}/stabilise', [UrgenceController::class, 'marquerStabilise']);
    Route::get('/', [UrgenceController::class, 'enCours']);
});

// MÉTHODE SPÉCIALE: Transfert de dossier dans DossierController
Route::patch('/dossiers/{id}/transferer', [DossierController::class, 'transferer']);
```

---

## 🔴 **5. MIDDLEWARES MANQUANTS**

### ✅ À créer :

#### 5.1 Middleware: `VerifyRole`
- Vérifie que l'utilisateur a le rôle requis
- Exemple: `Route::middleware('role:Medecin')`

#### 5.2 Middleware: `VerifyPermission`
- Vérifie que l'utilisateur a les permissions spécifiques
- Exemple: `Route::middleware('permission:edit-patient')`

#### 5.3 Middleware: `LogAudit`
- Enregistre chaque action (CREATE, READ, UPDATE, DELETE) dans la table audit_logs
- Appliqué globalement sur les routes API protégées

#### 5.4 Middleware: `CheckEtablissementAccess`
- Vérifie qu'un utilisateur d'établissement ne peut voir que ses propres données
- À appliquer sur les routes établissement/*/

#### 5.5 Middleware: `EncodeUrgence`
- Marque les requêtes en mode urgence
- Permet d'accélérer les traitements

---

## 🔴 **6. SERVICES / BUSINESS LOGIC MANQUANTS**

### ✅ À créer :

#### 6.1 Service: `FacturationService`
```php
public function creerFactureConsultation(Consultation $consultation, Patient $patient)
public function creerFactureExamens(array $examens, Patient $patient)
public function calculerMontantRestant(Facture $facture)
public function marquerCommePayee(Facture $facture, Paiement $paiement)
public function genererPDF(Facture $facture)
public function getRapportFinancier($date_debut, $date_fin)
```

#### 6.2 Service: `PaiementService`
```php
public function traiterPaiement(Facture $facture, $montant, $methode)
public function validerTransactionMobileMoneyMock() // Pour test
public function rembouser(Paiement $paiement)
public function verifierStatutPaiement($reference)
```

#### 6.3 Service: `QRCodeService`
```php
public function genererQRCodePatient(Patient $patient)
public function scannerQRCode($qr_string)
public function recupererPatientParQR($qr_code)
```

#### 6.4 Service: `NotificationService`
```php
public function notifierResultatsAnalyse(AnalyseLaboratoire $analyse)
public function notifierConsultation(Consultation $consultation)
public function notifierTransfert(TransfertDossier $transfert)
public function envoyer(User $user, $type, $titre, $contenu, $donnees = [])
```

#### 6.5 Service: `AuditService`
```php
public function enregistrer($action, $auditable, $ancien_contenu, $nouveau_contenu)
public function enregistrerAuto() // via middleware
public function getRapport($filtres)
```

#### 6.6 Service: `TransfertService`
```php
public function demanderTransfert(Dossier $dossier, Etablissement $destination, $raison)
public function accepterTransfert(TransfertDossier $transfert)
public function refuserTransfert(TransfertDossier $transfert)
public function realiserTransfert(TransfertDossier $transfert)
public function copierDossierComplet(Dossier $source, Etablissement $destination)
```

#### 6.7 Service: `UrgenceService`
```php
public function activerModeUrgence(Patient $patient, Medecin $medecin)
public function obtenirInfosVitales(Patient $patient)
public function marquerStabilise(Urgence $urgence)
public function genererFactureRetard(Urgence $urgence)
```

---

## 🔴 **7. VALIDATIONS / REQUESTS MANQUANTES**

### ✅ À créer :

- `CreateFactureRequest`
- `CreatePaiementRequest`
- `UpdateFactureStatusRequest`
- `CreateQRCodeRequest`
- `ScannerQRCodeRequest`
- `CreateNotificationRequest`
- `CreateTransfertRequest`
- `AccepterTransfertRequest`
- `CreateUrgenceRequest`
- `UpdateUrgenceRequest`

---

## 🔴 **8. RELATIONS MODÈLES À AJOUTER/CORRIGER**

### Patient Model - À ajouter:
```php
public function factures()
public function qrcode()
public function urgences()
public function transferts()
```

### Medecin Model - À ajouter:
```php
public function prescriptionsAnalyses() // AnalyseLaboratoire
public function urgencesTraitees() // Urgence
```

### Dossier Model - À ajouter:
```php
public function transferts() // TransfertDossier
public function urgences() // Urgence
```

### User Model - À ajouter:
```php
public function auditLogs() // AuditLog
public function notifications() // Notification
public function paiements() // Paiement
public function transfertsSource() // User as Source
public function transfertsDestination() // User as Destination
```

---

## 🔴 **9. AMÉLIORATION MIGRATIONS EXISTANTES**

### Consultations Table - À améliorer:
```php
// Ajouter:
- statut (enum: en_attente, terminee, payee) [La consultation ne peut être vue que si PAYÉE]
- montant_consultation (decimal)
```

### Analyses_Laboratoire Table - À améliorer:
```php
// Ajouter:
- statut_paiement (enum: non_payee, payee) [IMPORTANT: pas de test sans paiement]
- montant_analyse (decimal)
- facture_id (FK optionnelle)
```

### Documents Table - Données existantes OK

---

## 🔴 **10. EVENTS / LISTENERS MANQUANTS**

### Events à créer:
- `PaiementEffectue`
- `FactureCreee`
- `ResultatsAnalyseDisponibles`
- `DossierTransfere`
- `UrgenceActivee`
- `UrgenceStabilisee`
- `NotificationEnvoyee`

### Listeners à créer:
- `EnvoyerNotificationResultats` - Listener pour `ResultatsAnalyseDisponibles`
- `EnvoyerNotificationTransfert` - Listener pour `DossierTransfere`
- `ArchiversPaiement` - Listener pour `PaiementEffectue`
- `MettreAJourStatistiques` - Listener pour plusieurs events

---

## 🔴 **11. JOBS / QUEUE MANQUANTS**

### Jobs à créer:
- `GeneratePDF` - Générer PDF de facture
- `SendNotification` - Envoyer notifications en arrière-plan
- `ProcessPaiementMobileMoneyMock` - Simuler traitement paiement
- `SyncDossierTransfert` - Synchroniser le transfert de dossier

---

## 🔴 **12. TESTS MANQUANTS**

### Test Files à créer:
- `FactureTest` - Créer, payer, générer PDF
- `PaiementTest` - Enregistrer, confirmer, rembourser
- `QRCodeTest` - Générer, scanner
- `NotificationTest` - Envoyer, marquer lu
- `AuditTest` - Enregistrer actions
- `TransfertTest` - Demander, accepter, réaliser
- `UrgenceTest` - Activer, obtenir infos vitales, stabiliser
- `FacturationFlowTest` - Flux complet: Consultation → Facture → Paiement → Consultation visible

---

## 🔴 **13. SEEDERS MANQUANTS**

### À améliorer / créer:
- `RoleSeeder` - Ajouter roles : "Agent d'accueil", "Agent Caisse"
- `PermissionSeeder` - Créer les permissions (create-patient, edit-patient, etc.)
- `RolePermissionSeeder` - Assigner permissions aux rôles
- `FactureSeeder` - Créer quelques factures de test
- `PaiementSeeder` - Créer quelques paiements
- `TransfertSeeder` - Créer quelques transferts de test
- `UrgenceSeeder` - Créer des urgences de test

---

## 🔴 **14. TRAITS À CRÉER**

### Traits utiles:
#### `HasAuditLog` Trait
```php
// Ajoute automatiquement l'audit pour le modèle
protected function auditableEvents() { return ['created', 'updated', 'deleted']; }
```

#### `Notifiable` Trait
```php
// Envoie automatiquement les notifications
public function notify($notification)
```

---

## 🔴 **15. CONFIGURATION / ENV MANQUANTES**

### `.env` - Variables à ajouter:
```env
# Mobile Money API (Benin)
MOBILE_MONEY_API_URL=
MOBILE_MONEY_API_KEY=
MOBILE_MONEY_MERCHANT_ID=

# QR Code
QR_CODE_SECRET_KEY=

# PDF Generation
PDF_LIBRARY=dompdf

# Audit
ENABLE_AUDIT_LOGS=true

# Notifications
NOTIFICATION_QUEUE_DRIVER=database
```

### `config/audit.php` - Nouvelle config
```php
return [
    'enabled' => env('ENABLE_AUDIT_LOGS', true),
    'models' => [
        'Patient', 'Consultation', 'Facture', 'Paiement',
        'TransfertDossier', 'Urgence', 'AnalyseLaboratoire'
    ],
    'log_actions' => ['create', 'read', 'update', 'delete'],
];
```

---

## 🔴 **16. ENUMS À CRÉER**

```php
App\Enums\StatutFacture (non_payée, payée, remboursée)
App\Enums\MethodePaiement (mobile_money, espèces)
App\Enums\TypeFacturation (consultation, examen, urgence)
App\Enums\StatutConsultation (en_attente, terminee, payee)
App\Enums\StatutAnalyse (prescrit, preleve, en_cours, termine, non_paye, paye)
App\Enums\StatutTransfert (demandé, accepté, refusé, réalisé)
App\Enums\NiveauSeveriteUrgence (critique, grave, urgent)
App\Enums\StatutUrgence (actif, stabilisé, référé)
App\Enums\TypeNotification (resultat_analyse, transfert, consultation, paiement)
```

---

## 🟡 **17. AMÉLIORATIONS DE SECURITY À EFFECTUER**

- ✅ Ajouter `encrypt` sur les champs sensibles: numéros de facture, références paiement
- ✅ Rate limiter sur les endpoints de paiement
- ✅ Validation IP pour les transactions Mobile Money
- ✅ 2FA optional pour les établissements
- ✅ Scopes Sanctum par rôle (medecin ne peut lire que ses patients, etc.)

---

## 🟡 **18. PACKAGES COMPOSER À AJOUTER**

```json
"barryvdh/laravel-dompdf": "^2.1",  // PDF generation
"endroid/qr-code": "^4.8",           // QR Code generation
"spatie/laravel-permission": "^6.0", // RBAC avancé (optionnel, vous faites le vôtre)
"spatie/laravel-audit": "^4.2",      // Audit logs automatiques
"laravel/breeze": "^1.29",           // Auth scaffolding (si nécessaire)
```

---

## 📊 **RÉSUMÉ EN CHIFFRES**

| Catégorie | Nombre | Statut |
|-----------|--------|--------|
| **Migrations** | 12 | ❌ Manquantes |
| **Modèles** | 7 | ❌ Manquants |
| **Controllers** | 7 | ❌ Manquants |
| **Routes** | ~45 | ❌ Manquantes |
| **Middlewares** | 5 | ❌ Manquants |
| **Services** | 7 | ❌ Manquants |
| **Form Requests** | 10 | ❌ Manquants |
| **Events** | 7 | ❌ Manquants |
| **Listeners** | 4 | ❌ Manquants |
| **Jobs** | 4 | ❌ Manquants |
| **Enums** | 9 | ❌ Manquants |
| **Traits** | 2 | ❌ Manquants |
| **Tests** | 8+ | ❌ Manquants |
| **Seeders** | 7 | ❌ Manquants |
| **Config Files** | 1 | ❌ Manquants |

**Total: ~135+ éléments à créer/améliorer**

---

## 🎯 **ORDRE DE PRIORITÉ RECOMMANDÉ**

### Phase 1 (CRITIQUE - Système de paiement):
1. ✅ Migrations: factures, paiements
2. ✅ Modèles: Facture, Paiement
3. ✅ Controllers: FactureController, PaiementController
4. ✅ Routes de paiement
5. ✅ FacturationService, PaiementService
6. ✅ Enums: StatutFacture, MethodePaiement, TypeFacturation

### Phase 2 (TRÈS IMPORTANT - Urgence & Sécurité):
1. ✅ Migrations: urgences, qr_codes, audit_logs
2. ✅ Modèles: Urgence, QRCode, AuditLog
3. ✅ Controllers: UrgenceController, QRCodeController, AuditController
4. ✅ Routes d'urgence
5. ✅ Services: UrgenceService, QRCodeService, AuditService
6. ✅ Middleware: LogAudit

### Phase 3 (IMPORTANT - Fonctionnalités):
1. ✅ Migrations: notifications, transferts
2. ✅ Modèles: Notification, TransfertDossier
3. ✅ Controllers: NotificationController, TransfertController
4. ✅ Services: NotificationService, TransfertService
5. ✅ Events, Listeners, Jobs

### Phase 4 (COMPLÉTION):
1. ✅ Middlewares avancés
2. ✅ Tests
3. ✅ Seeders
4. ✅ Configuration
5. ✅ Amélioration security

---

