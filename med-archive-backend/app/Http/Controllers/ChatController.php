<?php

namespace App\Http\Controllers;

use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /** Contacts strictly related to the authenticated account. */
    public function contacts(Request $request)
    {
        $user = $request->user()->loadMissing([
            'patient.dossier.serviceProprietaire.user',
            'patient.dossier.serviceProprietaire.etablissement',
            'patient.dossier.serviceProprietaire.medecins.user',
            'patient.dossier.medecinReferent.user',
            'patient.service.user',
            'patient.service.etablissement',
            'patient.service.medecins.user',
            'medecin.etablissement',
            'medecin.patients',
            'service.etablissement',
        ]);

        $contacts = collect();
        if ($user->isPatient() && $user->patient?->dossier) {
            $contacts = $this->patientContacts($user);
        } elseif ($user->isMedecin() && $user->medecin) {
            $etablissementId = $user->medecin->etablissement_id;
            $contacts->push($user->medecin->etablissement);
            $contacts = $contacts->merge($this->contactsForEtablissement($etablissementId));
        } elseif ($user->isService() && $user->service) {
            $contacts->push($user->service->etablissement);
            $contacts = $contacts->merge(
                User::whereHas('patient.dossier', fn ($q) => $q->where('service_proprietaire_id', $user->service->id))->get()
            );
        } elseif ($user->isEtablissement()) {
            $contacts = $this->contactsForEtablissement($user->id);
        }

        return response()->json([
            'success' => true,
            'data' => $contacts->filter()->unique('id')->reject(fn ($contact) => $contact->id === $user->id)->values()->map(fn ($contact) => [
                'id' => $contact->id,
                'name' => $contact->name,
                'email' => $contact->email,
                'phone' => $contact->telephone,
                'role' => $contact->role?->nom ?? 'Contact',
            ]),
        ]);
    }

    public function messages(Request $request, User $contact)
    {
        abort_unless($this->isAllowedContact($request->user(), $contact->id), 403, 'Contact non autorise.');

        $messages = SystemNotification::query()
            ->where('type', 'chat_message')
            ->where(function ($query) use ($request, $contact) {
                $query->where(function ($q) use ($request, $contact) {
                    $q->where('user_id', $request->user()->id)->where('meta->sender_id', $contact->id);
                })->orWhere(function ($q) use ($request, $contact) {
                    $q->where('user_id', $contact->id)->where('meta->sender_id', $request->user()->id);
                });
            })
            ->oldest('created_at')->get();

        $messages->where('user_id', $request->user()->id)->whereNull('read_at')->each->update(['read_at' => now()]);

        return response()->json(['success' => true, 'data' => $messages]);
    }

    public function send(Request $request, User $contact)
    {
        abort_unless($this->isAllowedContact($request->user(), $contact->id), 403, 'Contact non autorise.');
        $data = $request->validate(['body' => 'required|string|max:5000']);

        $message = SystemNotification::create([
            'event_key' => 'chat:' . (string) Str::uuid(),
            'type' => 'chat_message',
            'title' => $request->user()->name,
            'body' => $data['body'],
            'user_id' => $contact->id,
            'meta' => ['sender_id' => $request->user()->id, 'recipient_id' => $contact->id],
        ]);

        return response()->json(['success' => true, 'data' => $message], 201);
    }

    private function isAllowedContact(User $user, int $contactId): bool
    {
        if ($user->isPatient()) {
            return $this->patientContacts($user)->contains('id', $contactId);
        }
        if ($user->isMedecin() && $user->medecin) {
            return $contactId === (int) $user->medecin->etablissement_id
                || $this->contactsForEtablissement($user->medecin->etablissement_id)->contains('id', $contactId);
        }
        if ($user->isService() && $user->service) {
            return $contactId === (int) $user->service->etablissement_id || User::where('id', $contactId)->whereHas('patient.dossier', fn ($q) => $q->where('service_proprietaire_id', $user->service->id))->exists();
        }
        return $user->isEtablissement()
            && $this->contactsForEtablissement($user->id)->contains('id', $contactId);
    }

    /** Tous les utilisateurs et services rattachés à un même hôpital. */
    private function contactsForEtablissement(int $etablissementId)
    {
        return User::query()
            ->where(function ($query) use ($etablissementId) {
                $query->where('etablissement_id', $etablissementId)
                    ->orWhereHas('service', fn ($serviceQuery) => $serviceQuery->where('etablissement_id', $etablissementId))
                    ->orWhereHas('patient.service', fn ($serviceQuery) => $serviceQuery->where('etablissement_id', $etablissementId))
                    ->orWhereHas('patient.dossier.serviceProprietaire', fn ($serviceQuery) => $serviceQuery->where('etablissement_id', $etablissementId));
            })
            ->with('role')
            ->get();
    }

    /** Contacts attached to the patient's active service and establishment. */
    private function patientContacts(User $user)
    {
        $patient = $user->patient;
        $dossier = $patient?->dossier;
        $service = $dossier?->serviceProprietaire ?? $patient?->service;

        return collect([
            $dossier?->medecinReferent?->user,
            $service?->user,
            $service?->etablissement,
        ])->merge($service?->medecins?->pluck('user') ?? collect())
            ->filter();
    }
}
