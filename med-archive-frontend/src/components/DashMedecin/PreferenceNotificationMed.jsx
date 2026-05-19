import React, { useState } from 'react';

const PreferencesNotificationsMed = () => {
  // État des toggles
  const [notifications, setNotifications] = useState({
    analyses: true,
    nouveauxDocuments: true,
    rappelRendezVous: false
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Notifications</h1>
      </section>

      <div className="settings-shell">
        {/* Menu latéral */}
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          <a className="settings-nav-item" href="/espacemedecin/profil">
            <i className="fa-regular fa-user"></i><span>Profil</span>
          </a>
          <a className="settings-nav-item" href="/espacemedecin/parametres">
            <i className="fa-regular fa-user"></i><span>Paramètres du profil</span>
          </a>
          <a className="settings-nav-item" href="/espacemedecin/securite-compte">
            <i className="fa-solid fa-lock"></i><span>Sécurité du compte</span>
          </a>
          <a className="settings-nav-item active" href="/espacemedecin/preferences-notifications">
            <i className="fa-regular fa-bell"></i><span>Notifications</span>
          </a>
          <a className="settings-nav-item" href="/espacemedecin/contacts-medicaux">
            <i className="fa-regular fa-circle-check"></i><span>Contacts médicaux</span>
          </a>
        </aside>

        {/* Panneau principal */}
        <article className="settings-main-card">
          <section className="settings-extra settings-extra-first">
            <h3>Préférences de notifications</h3>
            <p>Le patient peut choisir les notifications.</p>
            <div className="settings-toggle-list">
              <label className="settings-toggle-row">
                <span>Résultats d’analyses</span>
                <span className="switch-control">
                  <input
                    type="checkbox"
                    checked={notifications.analyses}
                    onChange={() => handleToggle('analyses')}
                  />
                  <span className="switch-slider"></span>
                </span>
              </label>
              <label className="settings-toggle-row">
                <span>Nouveaux documents</span>
                <span className="switch-control">
                  <input
                    type="checkbox"
                    checked={notifications.nouveauxDocuments}
                    onChange={() => handleToggle('nouveauxDocuments')}
                  />
                  <span className="switch-slider"></span>
                </span>
              </label>
              <label className="settings-toggle-row">
                <span>Rappel de rendez-vous</span>
                <span className="switch-control">
                  <input
                    type="checkbox"
                    checked={notifications.rappelRendezVous}
                    onChange={() => handleToggle('rappelRendezVous')}
                  />
                  <span className="switch-slider"></span>
                </span>
              </label>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
};

export default PreferencesNotificationsMed;