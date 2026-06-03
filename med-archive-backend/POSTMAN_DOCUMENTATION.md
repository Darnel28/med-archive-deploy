# Documentation - Collection Postman Med-Archive API

## 📋 Vue d'ensemble

Cette collection Postman vous permet de tester **tous les endpoints** de l'API Med-Archive Backend. Elle contient:

- **3 routes publiques** (Health Check, Login, Register)
- **3+ routes d'authentification** protégées
- **60+ endpoints** organisés par domaine fonctionnel (incluant factures, paiements, QR code, transferts)

## 📦 Installation

### 1. Importer la Collection
- Ouvrez Postman
- Cliquez sur **Import** (en haut à gauche)
- Sélectionnez l'un des fichiers suivants selon vos besoins :
  - `med-archive-api.postman_collection.json` : Collection complète de tous les endpoints
  - `med-archive-api2.postman_collection.json` : Collection de tests pour les nouvelles fonctionnalités (paiements, QR code, transferts)
- Cliquez sur **Import**

### 2. Importer l'Environnement
- Cliquez sur **Environment** (à gauche)
- Cliquez sur **Import**
- Sélectionnez le fichier `med-archive-env.postman_environment.json`
- Cliquez sur **Import**

### 3. Sélectionner l'Environnement
- En haut à droite, sélectionnez **Med-Archive Development** dans le dropdown d'environnement

## 🔧 Configuration des Variables

L'environnement contient les variables suivantes à mettre à jour:

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `base_url` | http://localhost:8000/api | URL de base de l'API |
| `token` | (vide) | Token d'authentification (rempli après login) |
| `user_id` | 1 | ID de l'utilisateur pour les tests |
| `patient_id` | 1 | ID du patient pour les tests |
| `medecin_id` | 1 | ID du médecin pour les tests |
| `dossier_id` | 1 | ID du dossier pour les tests |
| `consultation_id` | 1 | ID de la consultation pour les tests |
| `laboratoire_id` | 1 | ID du laboratoire pour les tests |
| `analyse_id` | 1 | ID de l'analyse pour les tests |
| `document_id` | 1 | ID du document pour les tests |

## 🚀 Workflow de Test Recommandé

### Étape 1: Vérifier la connectivité
1. Allez dans **ROUTES PUBLIQUES** → **Health Check**
2. Cliquez sur **Send**
3. Vous devriez voir une réponse: `{"message": "pong"}`

### Étape 2: S'authentifier
1. Allez dans **ROUTES PUBLIQUES** → **Login**
2. Modifiez l'email et le mot de passe dans le corps de la requête
3. Cliquez sur **Send**
4. Le token sera **automatiquement sauvegardé** dans la variable `{{token}}`

**Note**: Une collection de tests Postman a été configurée pour extraire automatiquement le token de la réponse de login.

### Étape 3: Tester les endpoints protégés
Après l'authentification, tous les endpoints protégés sont disponibles:
- 🔐 Authentification (get current user, refresh token, logout)
- 👥 Utilisateurs (CRUD + actions)
- 🏥 Patients (CRUD + consultations, QR code, recherche IMU)
- 👨‍⚕️ Médecins (CRUD + planning)
- 📋 Dossiers (CRUD + archive/transfert)
- 🏥 Consultations (CRUD + constantes vitales)
- 🏢 Établissements (données, médecins, patients, consultations)
- 🧪 Laboratoires (CRUD + analyses)
- 🔬 Analyses (CRUD + résultats)
- 📄 Documents (CRUD + télé​chargement/affichage)
- 💰 Factures (CRUD + paiement, PDF)
- 💳 Paiements (consultation)
- 📊 Statistiques (globales && par domaine)

## 📡 Organisation des Endpoints

### Routes Publiques
```
GET   /ping              - Health check
POST  /login             - Authentification
POST  /register          - Enregistrement
```

### Authentification (Protégé)
```
GET   /me               - Utilisateur actuel
POST  /refresh          - Rafraîchir token
POST  /logout           - Déconnexion
```

### Ressources CRUD (apiResource)
```
GET    /resource              - Liste
POST   /resource              - Créer
GET    /resource/{id}         - Voir
PUT    /resource/{id}         - Modifier
DELETE /resource/{id}         - Supprimer
```

Ressources: users, patients, medecins, dossiers, consultations, laboratoires, analyses, documents

### Endpoints Spécifiques par Domaine

#### Utilisateurs
```
POST   /users/{id}/desactiver      - Désactiver un utilisateur
POST   /users/{id}/activer         - Activer un utilisateur
GET    /statistiques/utilisateurs  - Stats utilisateurs
```

#### Patients
```
GET    /patients/{id}/dossier-complet     - Dossier complet
GET    /statistiques/patients             - Stats patients
```

#### Médecins
```
GET    /medecins/{id}/planning      - Planning du médecin
GET    /medecins/{id}/patients      - Patients du médecin
```

#### Dossiers
```
GET    /dossiers/{id}/resume        - Résumé du dossier
POST   /dossiers/{id}/archiver      - Archiver
POST   /dossiers/{id}/transferer    - Transférer vers établissement
```

#### Consultations
```
POST   /consultations/{id}/constantes     - Ajouter constantes vitales
GET    /statistiques/consultations        - Stats consultations
```

#### Établissements
```
GET    /etablissement/mes-donnees         - Données établissement
GET    /etablissement/mes-medecins        - Médecins établissement
GET    /etablissement/mes-patients        - Patients établissement
GET    /etablissement/mes-consultations   - Consultations établissement
GET    /etablissement/statistiques        - Stats établissement
GET    /etablissement/dashboard           - Dashboard établissement
PUT    /etablissement/info                - Modifier info établissement
```

#### Laboratoires
```
GET    /laboratoires/{id}/analyses-en-attente  - Analyses en attente
GET    /laboratoires/{id}/statistiques         - Stats laboratoire
```

#### Analyses
```
PATCH  /analyses/{id}/statut               - Changer le statut
POST   /analyses/{id}/resultats            - Ajouter résultats
GET    /statistiques/analyses              - Stats analyses
```

#### Documents
```
GET    /documents/{id}/download            - Télécharger
GET    /documents/{id}/view                - Afficher
GET    /statistiques/documents             - Stats documents
```

#### Factures
```
GET    /factures                           - Lister factures (Admin)
POST   /factures                           - Créer facture (Admin)
GET    /factures/{id}                      - Voir facture (Admin/Patient)
POST   /factures/{id}/paiement             - Payer facture (Admin/Patient)
GET    /factures/{id}/pdf                  - Télécharger PDF facture (Admin/Patient)
```

#### Paiements
```
GET    /paiements                          - Lister paiements (Admin)
GET    /paiements/{id}                     - Voir paiement (Admin)
```

#### Statistiques Globales
```
GET    /statistiques/dashboard             - Dashboard global
GET    /statistiques/avancees              - Stats avancées
```

#### QR Code et IMU
```
GET    /patients/imu/{imu}                 - Recherche patient par IMU
GET    /patients/{id}/qrcode               - Générer QR code patient
```

#### Transfert de Dossier
```
PATCH  /dossiers/{id}/transferer            - Transférer dossier (Médecin/Admin)
```

## 🔐 Authentification

Tous les endpoints protégés nécessitent le header:
```
Authorization: Bearer <token>
```

Ce header est **automatiquement ajouté** par Postman à chaque requête grâce à la variable `{{token}}`.

### Processus d'authentification

1. **Login**: Envoie email + password → reçoit token
2. **Le token est sauvegardé** dans la variable `{{token}}` automatiquement
3. **Tous les endpoints ultérieurs** utilisent ce token
4. **Logout**: Termine la session

## 🧪 Tests Automatiques

Certains endpoints ont des scripts de test automatiques:

- **Login**: Extrait et sauvegarde le token de la réponse
- Vous pouvez ajouter d'autres tests personnalisés (voir "Tests" dans Postman)

## 📝 Conseils d'Utilisation

1. **Testez toujours le Health Check d'abord** pour vérifier que l'API est accessible
2. **Loggez-vous avant de tester les endpoints protégés**
3. **Modifiez les IDs** dans les variables d'environnement pour tester différentes ressources
4. **Consultez les corps de requête** préfabriqués comme exemples
5. **Utilisez les descriptions** pour comprendre ce que chaque endpoint fait
6. **Vérifiez les codes de statut HTTP** (200, 201, 400, 404, 500, etc.)

## 🐛 Dépannage

### "401 Unauthorized"
- Votre token a expiré ou est invalide
- Relancez le **Login** pour obtenir un nouveau token

### "404 Not Found"
- L'ID que vous testez n'existe pas en base de données
- Mettez à jour les variables avec des IDs valides

### "422 Unprocessable Entity"
- Les données envoyées ne valident pas
- Vérifiez le corps de la requête (format JSON valide, champs requis, etc.)

### "500 Internal Server Error"
- Erreur serveur
- Vérifiez les logs du serveur Laravel: `storage/logs/laravel.log`

## 📚 Ressources Utiles

- [Documentation Laravel](https://laravel.com/docs)
- [Documentation Postman](https://learning.postman.com/)
- [API REST Best Practices](https://restfulapi.net/)

## 📧 Support

Pour toute question ou problème avec la collection, consultez:
- Les fichiers de migration de base de données
- Les contrôleurs dans `app/Http/Controllers/`
- Les modèles dans `app/Models/`
- Le fichier `routes/api.php`

---

**Dernière mise à jour**: 2026-05-05
**Version**: 2.0
