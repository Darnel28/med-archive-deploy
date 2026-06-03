<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'telephone' => $this->faker->phoneNumber(),
            'adresse' => $this->faker->address(),
            'ville' => $this->faker->city(),
            'date_naissance' => $this->faker->dateTimeBetween('-80 years', '-18 years'),
            'sexe' => $this->faker->randomElement(['M', 'F']),
            'role_id' => Role::factory(),
            'etablissement_id' => null,
            'statut' => 'actif',
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Indiquer que l'utilisateur est un administrateur
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $attributes['role_id'] ?? Role::firstOrCreate(['nom' => 'Super Admin'], ['description' => 'Administrateur système'])->id,
            'name' => 'Admin Système',
            'email' => 'admin@medarchive.bj'
        ]);
    }

    /**
     * Indiquer que l'utilisateur est un médecin
     */
    public function medecin(?User $etablissement = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $attributes['role_id'] ?? Role::firstOrCreate(['nom' => 'Medecin'], ['description' => 'Médecin traitant'])->id,
            'etablissement_id' => $attributes['etablissement_id'] ?? $etablissement?->id ?? User::factory()->create(['role_id' => Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Responsable d\'établissement de santé'])->id])->id,
            'name' => 'Dr. ' . $this->faker->lastName()
        ]);
    }

    /**
     * Indiquer que l'utilisateur est un patient
     */
    public function patient(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $attributes['role_id'] ?? Role::firstOrCreate(['nom' => 'Patient'], ['description' => 'Patient'])->id,
            'etablissement_id' => $attributes['etablissement_id'] ?? null
        ]);
    }

    /**
     * Indiquer que l'utilisateur est un établissement
     */
    public function etablissement(): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $attributes['role_id'] ?? Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Responsable d\'établissement de santé'])->id,
            'etablissement_id' => $attributes['etablissement_id'] ?? null,
            'name' => $attributes['name'] ?? $this->faker->company() . ' ' . $this->faker->randomElement(['Hospital', 'Clinic', 'Center']),
            'email' => $attributes['email'] ?? 'contact@' . $this->faker->domainName()
        ]);
    }

    /**
     * Indiquer que l'utilisateur est un laborantin
     */
    public function laborantin(?User $etablissement = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role_id' => $attributes['role_id'] ?? Role::firstOrCreate(['nom' => 'Laborantin'], ['description' => 'Personnel de laboratoire'])->id,
            'etablissement_id' => $attributes['etablissement_id'] ?? $etablissement?->id ?? User::factory()->create(['role_id' => Role::firstOrCreate(['nom' => 'Responsable Etablissement'], ['description' => 'Responsable d\'établissement de santé'])->id])->id,
            'name' => $attributes['name'] ?? $this->faker->name()
        ]);
    }

    /**
     * Indiquer que l'utilisateur est inactif
     */
    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'inactif'
        ]);
    }
}
