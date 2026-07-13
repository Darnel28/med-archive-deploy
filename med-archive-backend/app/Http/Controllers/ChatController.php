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
            'patient.dossier.medecinReferent.user',
            'medecin.etablissement',
            'medecin.patients',
            'service.etablissement',
        ]);

        $contacts = collect();
        if ($user->isPatient() && $user->patient?->dossier) {
            $dossier = $user->patient->dossier;
            $contacts->push($dossier->medecinReferent?->user, $dossier->serviceProprietaire?->user, $dossier->serviceProprietaire?->etablissement);
        } elseif ($user->isMedecin() && $user->medecin) {
            $contacts->push($user->medecin->etablissement);
            $contacts = $contacts->merge($user->medecin->patients()->get());
        } elseif ($user->isService() && $user->service) {
            $contacts->push($user->service->etablissement);
            $contacts = $contacts->merge(
                User::whereHas('patient.dossier', fn ($q) => $q->where('service_proprietaire_id', $user->service->id))->get()
            );
        } elseif ($user->isEtablissement()) {
            $contacts = User::where('etablissement_id', $user->id)->get();
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
            $dossier = $user->patient?->dossier;
            return in_array($contactId, array_filter([$dossier?->medecinReferent?->user_id, $dossier?->serviceProprietaire?->user_id, $dossier?->serviceProprietaire?->etablissement_id]));
        }
        if ($user->isMedecin() && $user->medecin) {
            return $contactId === (int) $user->medecin->etablissement_id || $user->medecin->patients()->where('users.id', $contactId)->exists();
        }
        if ($user->isService() && $user->service) {
            return $contactId === (int) $user->service->etablissement_id || User::where('id', $contactId)->whereHas('patient.dossier', fn ($q) => $q->where('service_proprietaire_id', $user->service->id))->exists();
        }
        return $user->isEtablissement() && User::where('id', $contactId)->where('etablissement_id', $user->id)->exists();
    }
}
