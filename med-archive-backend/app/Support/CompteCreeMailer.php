<?php

namespace App\Support;

use App\Mail\CompteCreeMail;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class CompteCreeMailer
{
    public static function send(User $user, string $plainPassword, string $context, ?string $loginUrl = null): ?string
    {
        $mailConfig = self::mailConfigForLogs();

        Log::info('account_credentials_mail_attempt', [
            'context' => $context,
            'user_id' => $user->id,
            'recipient' => $user->email,
            'mail' => $mailConfig,
        ]);

        if (! blank(config('services.resend.key'))) {
            try {
                self::sendViaResend(
                    $user,
                    $plainPassword,
                    $loginUrl ?? 'https://med-archive-projet.onrender.com/connexion'
                );

                Log::info('account_credentials_mail_sent', [
                    'context' => $context,
                    'user_id' => $user->id,
                    'recipient' => $user->email,
                    'provider' => 'resend',
                    'mail' => $mailConfig,
                ]);

                return null;
            } catch (\Throwable $resendException) {
                $resendMessage = $resendException->getMessage();

                Log::error('account_credentials_mail_failed', [
                    'context' => $context,
                    'user_id' => $user->id,
                    'recipient' => $user->email,
                    'provider' => 'resend',
                    'exception_class' => $resendException::class,
                    'exception_message' => $resendMessage,
                    'exception_code' => $resendException->getCode(),
                    'mail' => $mailConfig,
                ]);

                if (str_contains($resendMessage, 'You can only send testing emails to your own email address')) {
                    return ucfirst($context) . ' cree, mais les identifiants ne sont pas envoyés.';
                }

                return ucfirst($context) . ' cree, mais les identifiants ne sont pas envoyés.';
            }
        }

        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            $warning = ucfirst($context) . ' cree. Le mailer est configure en mode log/array, donc les identifiants ne sont pas envoyes dans une boite mail.';

            Log::warning('account_credentials_mail_skipped', [
                'context' => $context,
                'user_id' => $user->id,
                'recipient' => $user->email,
                'reason' => 'mailer_is_not_smtp',
                'mail' => $mailConfig,
            ]);

            return $warning;
        }

        try {
            Mail::to($user->email)->send(new CompteCreeMail(
                $user,
                $plainPassword,
                $loginUrl ?? 'https://med-archive-projet.onrender.com/connexion'
            ));

            Log::info('account_credentials_mail_sent', [
                'context' => $context,
                'user_id' => $user->id,
                'recipient' => $user->email,
                'mail' => $mailConfig,
            ]);

            return null;
        } catch (\Throwable $mailException) {
            Log::error('account_credentials_mail_failed', [
                'context' => $context,
                'user_id' => $user->id,
                'recipient' => $user->email,
                'exception_class' => $mailException::class,
                'exception_message' => $mailException->getMessage(),
                'exception_code' => $mailException->getCode(),
                'mail' => $mailConfig,
            ]);

            $message = $mailException->getMessage();

            if (str_contains($message, 'Username and Password not accepted')) {
                return ucfirst($context) . ' cree, mais Gmail a refuse les identifiants SMTP. Verifiez le mot de passe d application Gmail.';
            }

            if (str_contains($message, 'Connection could not be established') || str_contains($message, 'timed out')) {
                return ucfirst($context) . ' cree, mais les identifiants ne sont pas envoyés.';
            }

            return ucfirst($context) . ' cree, mais l email des identifiants n a pas pu etre envoye.';
        }
    }

    private static function mailConfigForLogs(): array
    {
        $smtp = config('mail.mailers.smtp', []);

        return [
            'default' => config('mail.default'),
            'resend_key_set' => filled(config('services.resend.key')),
            'resend_from' => config('services.resend.from'),
            'smtp_host' => $smtp['host'] ?? null,
            'smtp_port' => $smtp['port'] ?? null,
            'smtp_scheme' => $smtp['scheme'] ?? null,
            'smtp_username_set' => filled($smtp['username'] ?? null),
            'smtp_password_set' => filled($smtp['password'] ?? null),
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name'),
        ];
    }

    private static function sendViaResend(User $user, string $plainPassword, string $loginUrl): void
    {
        $fromAddress = config('services.resend.from');

        if (blank($fromAddress)) {
            throw new RuntimeException('RESEND_FROM_ADDRESS or MAIL_FROM_ADDRESS is required.');
        }

        $response = Http::withToken(config('services.resend.key'))
            ->acceptJson()
            ->asJson()
            ->timeout(20)
            ->post('https://api.resend.com/emails', [
                'from' => self::formatFromAddress($fromAddress),
                'to' => [$user->email],
                'subject' => 'Bienvenue sur Med-Archive',
                'html' => view('emails.compte-cree', [
                    'user' => $user,
                    'password' => $plainPassword,
                    'loginUrl' => $loginUrl,
                ])->render(),
            ]);

        if ($response->failed()) {
            throw new RuntimeException('Resend API error ' . $response->status() . ': ' . $response->body());
        }
    }

    private static function formatFromAddress(string $address): string
    {
        if (str_contains($address, '<')) {
            return $address;
        }

        $name = config('mail.from.name');

        return $name ? "{$name} <{$address}>" : $address;
    }
}
