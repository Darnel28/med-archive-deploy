import React, { useState } from 'react';
import NavLink from 'react-router-dom';
import { FiUser, FiSettings, FiLock, FiBell } from 'react-icons/fi';
const PreferencesNotifications = () => {
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

<NavLink
  to="/espacepatient/profil"
  className={({ isActive }) =>
    `settings-nav-item${isActive ? " active" : ""}`
  }
>
  <FiUser />
  <span>Profil</span>
</NavLink>

<NavLink
  to="/espacepatient/parametres"
  className={({ isActive }) =>
    `settings-nav-item${isActive ? " active" : ""}`
  }
>
  <FiSettings />
  <span>Paramètres du profil</span>
</NavLink>

<NavLink
  to="/espacepatient/securite-compte"
  className={({ isActive }) =>
    `settings-nav-item${isActive ? " active" : ""}`
  }
>
  <FiLock />
  <span>Sécurité du compte</span>
</NavLink>

<NavLink
  to="/espacepatient/preferences-notifications"
  className={({ isActive }) =>
    `settings-nav-item${isActive ? " active" : ""}`
  }
>
  <FiBell />
  <span>Notifications</span>
</NavLink>
        </aside>

       
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

export default PreferencesNotifications;