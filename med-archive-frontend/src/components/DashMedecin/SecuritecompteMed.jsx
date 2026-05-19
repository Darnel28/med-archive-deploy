import React, { useState } from 'react';

const SecuriteCompteMed = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const handleChangePassword = () => {
    // Logique pour changer le mot de passe
    alert("Fonctionnalité : Changer le mot de passe");
  };

  const handleConnectedDevices = () => {
    // Logique pour voir les appareils connectés
    alert("Fonctionnalité : Voir les appareils connectés");
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Sécurité du compte</h1>
      </section>

      <div className="settings-shell">
        {/* Menu latéral de configuration */}
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          <a className="settings-nav-item" href="/espacemedecin/profil">
            <i className="fa-regular fa-user"></i><span>Profil</span>
          </a>
          <a className="settings-nav-item" href="/espacemedecin/parametres">
            <i className="fa-regular fa-user"></i><span>Paramètres du profil</span>
          </a>
          <a className="settings-nav-item active" href="/espacemedecin/securite-compte">
            <i className="fa-solid fa-lock"></i><span>Sécurité du compte</span>
          </a>
          <a className="settings-nav-item" href="/espacemedecin/preferences-notifications">
            <i className="fa-regular fa-bell"></i><span>Notifications</span>
          </a>
          <a className="settings-nav-item" href="/espacemedecin/contacts-medicaux">
            <i className="fa-regular fa-circle-check"></i><span>Contacts médicaux</span>
          </a>
        </aside>

        {/* Panneau principal */}
        <article className="settings-main-card">
          <section className="settings-extra settings-extra-first">
            <h3>Sécurité du compte</h3>
            <p>Gestion de la sécurité.</p>
            <div className="settings-action-list">
              <button className="btn btn-outline" type="button" onClick={handleChangePassword}>
                <i className="fa-solid fa-key"></i> Changer le mot de passe
              </button>

              <label className="settings-switch-row">
                <span>Activer la double authentification</span>
                <span className="switch-control">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={handleTwoFactorToggle}
                  />
                  <span className="switch-slider"></span>
                </span>
              </label>

              <button className="btn btn-outline" type="button" onClick={handleConnectedDevices}>
                <i className="fa-solid fa-laptop"></i> Voir les appareils connectés
              </button>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
};

export default SecuriteCompteMed;