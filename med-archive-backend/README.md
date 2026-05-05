<!-- <p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

--- -->

## 📁 Documentation API pour le développement Frontend

Ce projet expose une API REST sous le préfixe `/api` destinée à être consommée par le front-end.

### 🌐 URL de base

```
{{HOST}}/api
```

(Exemple local : `http://localhost:8000/api`)

### 🔓 Authentification

- **POST /login** – envoi `{ email, password }` → retourne un `token` Bearer.
- **POST /register** – envoi des infos utilisateur pour créer un compte.
- **Authorization** : toutes les routes protégées requièrent le header
  ````
  Authorization: Bearer <token>
  ````

> Le front doit récupérer le token après connexion et le stocker (localStorage, cookie sécurisé, etc.), puis l'ajouter aux futures requêtes.

### ✔️ Endpoints publics utiles

| Verbe | Route            | Description                    |
|-------|------------------|--------------------------------|
| GET   | /ping            | vérifie que l'API répond       |
| POST  | /login           | connexion                      |
| POST  | /register        | inscription                    |

### 🔐 Endpoints protégés par `auth:sanctum`

La structure courante est `apiResource` avec des routages CRUD standards, plus quelques actions spécifiques.

#### Utilisateurs (`/users`)
- CRUD classique (`GET /users`, `POST /users`, `GET /users/{id}`, etc.)
- `POST /users/{id}/desactiver`, `/users/{id}/activer`
- `GET /statistiques/utilisateurs`

#### Patients (`/patients`)
- CRUD
- `GET /patients/{id}/dossier-complet`
- `GET /statistiques/patients`

#### Médecins (`/medecins`)
- CRUD
- `GET /medecins/{id}/planning`
- `GET /medecins/{id}/patients`

#### Dossiers (`/dossiers`)
- CRUD
- `GET /dossiers/{id}/resume`
- `POST /dossiers/{id}/archiver`
- `POST /dossiers/{id}/transferer` (body: `{ etablissement_id }`)

#### Consultations (`/consultations`)
- CRUD
- `POST /consultations/{id}/constantes` (body: constantes vitales)
- `GET /statistiques/consultations`

#### Établissement (`/etablissement` prefix)
- `GET /mes-donnees`, `/mes-medecins`, `/mes-patients`, `/mes-consultations`
- `GET /statistiques` et `/dashboard`
- `PUT /info` (mise à jour des infos de l'établissement)

#### Laboratoires (`/laboratoires`)
- CRUD
- `GET /laboratoires/{id}/analyses-en-attente`
- `GET /laboratoires/{id}/statistiques`

#### Analyses (`/analyses`)
- CRUD
- `PATCH /analyses/{id}/statut` (body: `{ statut }`)
- `POST /analyses/{id}/resultats` (body: résultats + métadonnées)
- `GET /statistiques/analyses`

#### Documents (`/documents`)
- CRUD
- `GET /documents/{id}/download` & `/view`
- `GET /statistiques/documents`

#### Factures (`/factures`)
- `GET /factures` (middleware: Administrateur, AgentAccueil)
- `POST /factures` (middleware: AgentAccueil, Administrateur)
- `GET /factures/{id}` (middleware: Administrateur, AgentAccueil, Patient)
- `POST /factures/{id}/paiement` (middleware: AgentAccueil, Administrateur)
- `GET /factures/{id}/pdf` (middleware: Administrateur, AgentAccueil)

#### Paiements (`/paiements`)
- `GET /paiements` (middleware: Administrateur)
- `GET /paiements/{id}` (middleware: Administrateur)

#### Statistiques globales (`/statistiques` prefix)
- `GET /dashboard`
- `GET /avancees`

#### QR Code et IMU
- `GET /patients/imu/{imu}` – Recherche patient par IMU
- `GET /patients/{id}/qrcode` – Générer QR code pour patient

#### Transfert de dossier
- `PATCH /dossiers/{id}/transferer` (middleware: Medecin, Administrateur) – Transférer dossier vers autre établissement

### 🛠 Conseils pour l’équipe frontend

1. **Récupérer et stocker le token** après connexion.
2. **Ajouter le header Authorization** dans chaque requête protégée.
3. **Gérer les erreurs 401/403** en redirigeant vers la page de login.
4. **Utiliser les routes `/statistiques/...`** pour afficher des graphiques ou tableaux de bord.
5. **Vérifier les formats JSON attendus** via les controllers dans `app/Http/Controllers` si nécessaire.

### 📦 Environnement de développement

Importez la collection Postman `med-archive-api.postman_collection.json` fournie pour tester tous les endpoints.


