<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CompteCreeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $password,
        public string $loginUrl = 'https://medarchive.bj/login'
    ) {
    }

    public function build(): self
    {
        return $this->subject('Bienvenue sur Med-Archive')
            ->view('emails.compte-cree');
    }
}
