<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Bienvenue sur Med-Archive</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
    <h2 style="color: #0f766e;">Bienvenue sur Med-Archive</h2>

    <p>Bonjour {{ $user->name ?? 'Bonjour' }},</p>

    <p>Un compte a été créé pour vous sur la plateforme Med-Archive.</p>

    <p>Vos informations de connexion sont :</p>

    <p>
        <strong>Email :</strong> {{ $user->email }}<br>
        <strong>Mot de passe temporaire :</strong> {{ $password }}
    </p>

    <p>Vous pouvez vous connecter ici :</p>

    <p>
        <a href="{{ $loginUrl }}" style="color: #0f766e;">{{ $loginUrl }}</a>
    </p>

    <p>Pour des raisons de sécurité, vous devrez modifier votre mot de passe lors de votre première connexion.</p>

    <p>
        Cordialement,<br>
        L'équipe Med-Archive
    </p>
</body>
</html>
