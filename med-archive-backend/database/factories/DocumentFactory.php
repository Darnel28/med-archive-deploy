<?php

namespace Database\Factories;

use App\Models\Document;
use App\Models\Consultation;
use App\Models\TypeDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentFactory extends Factory
{
    protected $model = Document::class;

    public function definition(): array
    {
        $mimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        $mimeType = $this->faker->randomElement($mimeTypes);
        $extension = match($mimeType) {
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'application/msword' => 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            default => 'bin'
        };

        return [
            'consultation_id' => Consultation::factory(),
            'type_document_id' => TypeDocument::factory(),
            'titre' => $this->faker->sentence(3),
            'chemin_fichier' => 'documents/' . $this->faker->uuid() . '.' . $extension,
            'mime_type' => $mimeType,
            'taille' => $this->faker->numberBetween(50, 5000), // en Ko
            'description' => $this->faker->optional()->sentence(),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Document PDF
     */
    public function pdf(): static
    {
        return $this->state(fn (array $attributes) => [
            'mime_type' => 'application/pdf',
            'taille' => $this->faker->numberBetween(100, 3000)
        ]);
    }

    /**
     * Document image
     */
    public function image(): static
    {
        return $this->state(fn (array $attributes) => [
            'mime_type' => $this->faker->randomElement(['image/jpeg', 'image/png']),
            'taille' => $this->faker->numberBetween(200, 5000)
        ]);
    }

    /**
     * Type spécifique
     */
    public function deType(string $typeNom): static
    {
        $typeDocument = TypeDocument::where('nom', $typeNom)->first()
            ?? TypeDocument::factory()->create(['nom' => $typeNom]);

        return $this->state(fn (array $attributes) => [
            'type_document_id' => $typeDocument->id
        ]);
    }
}
