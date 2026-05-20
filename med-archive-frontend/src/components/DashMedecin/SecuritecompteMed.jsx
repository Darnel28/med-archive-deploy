import React, { useState } from 'react';

const SecuriteCompteMed = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handleConnectedDevices = () => {
    setShowDevicesModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handlePasswordFormChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmitPassword = (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    alert('Mot de passe mis à jour avec succès.');
    handleClosePasswordModal();
  };

  const handleCloseDevicesModal = () => {
    setShowDevicesModal(false);
  };

  return (
    <>
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
                <button className="security-action-btn" type="button" onClick={handleChangePassword}>
                  <i className="fa-solid fa-key"></i>
                  <span>Changer le mot de passe</span>
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

                <button className="security-action-btn" type="button" onClick={handleConnectedDevices}>
                  <i className="fa-solid fa-laptop"></i>
                  <span>Voir les appareils connectés</span>
                </button>
              </div>
            </section>
          </article>
        </div>
      </main>

      {showPasswordModal && (
        <div className="security-modal-backdrop" onClick={handleClosePasswordModal}>
          <div className="security-modal" onClick={(event) => event.stopPropagation()}>
            <div className="security-modal-header">
              <div>
                <p className="security-modal-kicker">Sécurité du compte</p>
                <h2>Changer le mot de passe</h2>
              </div>
              <button className="security-modal-close" type="button" onClick={handleClosePasswordModal} aria-label="Fermer">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form className="security-modal-form" onSubmit={handleSubmitPassword}>
              <label className="security-field">
                <span>Mot de passe actuel</span>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="Saisir le mot de passe actuel"
                />
              </label>

              <label className="security-field">
                <span>Nouveau mot de passe</span>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="Saisir le nouveau mot de passe"
                />
              </label>

              <label className="security-field">
                <span>Confirmer le nouveau mot de passe</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                  placeholder="Confirmer le mot de passe"
                />
              </label>

              <div className="security-modal-actions">
                <button type="button" className="security-btn security-btn-ghost" onClick={handleClosePasswordModal}>
                  Annuler
                </button>
                <button type="submit" className="security-btn security-btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDevicesModal && (
        <div className="security-modal-backdrop" onClick={handleCloseDevicesModal}>
          <div className="security-modal security-modal-lg" onClick={(event) => event.stopPropagation()}>
            <div className="security-modal-header">
              <div>
                <p className="security-modal-kicker">Sécurité du compte</p>
                <h2>Voir les appareils connectés</h2>
              </div>
              <button className="security-modal-close" type="button" onClick={handleCloseDevicesModal} aria-label="Fermer">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="security-device-list">
              <article className="security-device-card">
                <div>
                  <strong>Windows - Chrome</strong>
                  <p>Session active depuis Cotonou</p>
                </div>
                <span className="security-device-status active">Actif</span>
              </article>

              <article className="security-device-card">
                <div>
                  <strong>iPhone - Safari</strong>
                  <p>Dernière connexion il y a 2 heures</p>
                </div>
                <span className="security-device-status">Connecté</span>
              </article>

              <article className="security-device-card">
                <div>
                  <strong>MacBook - Firefox</strong>
                  <p>Dernière activité hier</p>
                </div>
                <span className="security-device-status muted">Inactif</span>
              </article>
            </div>

            <div className="security-modal-actions security-modal-actions-end">
              <button type="button" className="security-btn security-btn-primary" onClick={handleCloseDevicesModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecuriteCompteMed;