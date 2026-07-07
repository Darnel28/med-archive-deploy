import React, { useMemo, useState } from 'react';
import { FiBell, FiCheckCircle, FiChrome, FiLock, FiMonitor, FiSettings, FiSmartphone, FiTablet, FiUser, FiX } from 'react-icons/fi';
import { apiClient, getAuthUser } from '../../api/client';
import useAutoDismissMessage from '../../hooks/useAutoDismissMessage';

const detectDevice = () => {
  const ua = navigator.userAgent || '';
  const browser = ua.includes('Edg') ? 'Edge' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') && !ua.includes('Chrome') ? 'Safari' : 'Chrome';
  const device = /iPhone|Android.*Mobile/i.test(ua) ? 'Telephone' : /iPad|Tablet/i.test(ua) ? 'Tablette' : 'Ordinateur';
  const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' : 'Appareil';
  return { browser, device, os };
};

const getStoredSessions = () => {
  try {
    const rows = JSON.parse(localStorage.getItem('patient_connected_sessions') || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
};

const deviceIcon = (session) => {
  if (session.browser === 'Chrome') return <FiChrome />;
  if (session.device === 'Telephone') return <FiSmartphone />;
  if (session.device === 'Tablette') return <FiTablet />;
  return <FiMonitor />;
};

const SecuriteCompte = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useAutoDismissMessage(passwordMessage, setPasswordMessage);
  const [sessions, setSessions] = useState(() => {
    const current = detectDevice();
    const user = getAuthUser();
    const currentSession = {
      id: 'current',
      browser: current.browser,
      device: current.device,
      os: current.os,
      ip: 'Session actuelle',
      signedInAt: new Date().toISOString(),
      current: true,
      user: user?.name || 'Patient',
    };
    const saved = getStoredSessions().filter((session) => session.id !== 'current');
    const rows = [currentSession, ...saved];
    localStorage.setItem('patient_connected_sessions', JSON.stringify(rows));
    return rows;
  });

  const sessionCount = useMemo(() => sessions.length, [sessions]);

  const closeModal = () => {
    setActiveModal(null);
    setPasswordMessage('');
  };

  const revokeSession = (id) => {
    const nextSessions = sessions.filter((session) => session.id !== id || session.current);
    setSessions(nextSessions);
    localStorage.setItem('patient_connected_sessions', JSON.stringify(nextSessions));
  };

  const signOutOtherDevices = () => {
    const currentOnly = sessions.filter((session) => session.current);
    setSessions(currentOnly);
    localStorage.setItem('patient_connected_sessions', JSON.stringify(currentOnly));
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setPasswordMessage('');

    if (passwordForm.password.length < 8) {
      setPasswordMessage('Le nouveau mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordMessage('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient.post('/me/mot-de-passe', passwordForm);
      setPasswordMessage('Mot de passe modifie avec succes.');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (error) {
      setPasswordMessage(error?.response?.data?.message || 'Impossible de modifier le mot de passe.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Securite du compte</h1>
      </section>

      <div className="settings-shell">
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          <a className="settings-nav-item" href="/espacepatient/profil"><FiUser /><span>Profil</span></a>
          <a className="settings-nav-item" href="/espacepatient/parametres"><FiSettings /><span>Parametres du profil</span></a>
          <a className="settings-nav-item active" href="/espacepatient/securite-compte"><FiLock /><span>Securite du compte</span></a>
          <a className="settings-nav-item" href="/espacepatient/preferences-notifications"><FiBell /><span>Notifications</span></a>
          <a className="settings-nav-item" href="/espacepatient/contacts-medicaux"><FiCheckCircle /><span>Contacts medicaux</span></a>
        </aside>

        <article className="settings-main-card">
          <section className="settings-extra settings-extra-first">
            <h3>Securite du compte</h3>
            <p>Gestion de la securite.</p>
            <div className="settings-action-list">
              <button className="security-action-button" type="button" onClick={() => setActiveModal('password')}>
                <span className="security-action-icon"><FiLock /></span>
                <span>Changer le mot de passe</span>
              </button>

              <label className="settings-switch-row">
                <span>Activer la double authentification</span>
                <span className="switch-control">
                  <input type="checkbox" checked={twoFactorEnabled} onChange={() => setTwoFactorEnabled((enabled) => !enabled)} />
                  <span className="switch-slider"></span>
                </span>
              </label>

              <button className="security-action-button" type="button" onClick={() => setActiveModal('sessions')}>
                <span className="security-action-icon"><FiMonitor /></span>
                <span>Voir les appareils connectes</span>
                <strong>{sessionCount}</strong>
              </button>
            </div>
          </section>
        </article>
      </div>

      {activeModal === 'sessions' && (
        <div className="security-modal-backdrop" onClick={closeModal}>
          <section className="security-modal security-modal-narrow" onClick={(event) => event.stopPropagation()}>
            <button className="security-modal-close" type="button" onClick={closeModal}><FiX /></button>
            <h2>Vos sessions</h2>
            <p className="security-modal-copy">Liste des appareils qui ont ouvert votre compte. Retirez les sessions que vous ne reconnaissez pas.</p>
            <h3>Appareils</h3>
            <div className="security-device-list">
              {sessions.map((session) => (
                <article className="security-device-row" key={session.id}>
                  <div className="security-device-icon">{deviceIcon(session)}</div>
                  <div className="security-device-info">
                    <strong>{session.browser} sur {session.os}</strong>
                    <span>{session.ip}</span>
                    <small>{session.current ? 'Session actuelle' : `Connecte le ${new Date(session.signedInAt).toLocaleDateString('fr-FR')}`}</small>
                  </div>
                  <button type="button" disabled={session.current} onClick={() => revokeSession(session.id)}>
                    {session.current ? 'Actuel' : 'Retirer'}
                  </button>
                </article>
              ))}
            </div>
            <button className="security-primary-action" type="button" onClick={signOutOtherDevices}>Deconnecter les autres appareils</button>
          </section>
        </div>
      )}

      {activeModal === 'password' && (
        <div className="security-modal-backdrop" onClick={closeModal}>
          <form className="security-modal password-modal" onSubmit={submitPassword} onClick={(event) => event.stopPropagation()}>
            <button className="security-modal-close" type="button" onClick={closeModal}><FiX /></button>
            <h2>Mot de passe</h2>
            <label>
              Ancien mot de passe
              <span className="password-input-wrap">
                <FiLock />
                <input type="password" placeholder="Mot de passe" value={passwordForm.current_password} onChange={(event) => setPasswordForm((prev) => ({ ...prev, current_password: event.target.value }))} required />
              </span>
            </label>
            <label>
              Nouveau mot de passe
              <span className="password-input-wrap">
                <FiLock />
                <input type="password" placeholder="Nouveau mot de passe" value={passwordForm.password} onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))} required />
              </span>
              <small>Minimum 8 caracteres</small>
            </label>
            <label>
              Confirmer le nouveau mot de passe
              <span className="password-input-wrap">
                <FiLock />
                <input type="password" placeholder="Confirmer le nouveau mot de passe" value={passwordForm.password_confirmation} onChange={(event) => setPasswordForm((prev) => ({ ...prev, password_confirmation: event.target.value }))} required />
              </span>
              <small>Minimum 8 caracteres</small>
            </label>
            {passwordMessage && <p className="security-form-message">{passwordMessage}</p>}
            <button className="security-primary-action" type="submit" disabled={passwordLoading}>{passwordLoading ? 'Modification...' : 'Changer le mot de passe'}</button>
          </form>
        </div>
      )}

      <style>{`
        .settings-nav-item svg,
        .security-action-icon svg,
        .security-modal svg {
          display: block;
          color: currentColor;
          opacity: 1;
          stroke-width: 2.2;
          flex: 0 0 auto;
        }

        .security-action-button {
          min-height: 66px;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          border: 1px solid #dbe5ef;
          border-radius: 14px;
          padding: 14px 18px;
          background: #fff;
          color: #0f172a;
          font-weight: 700;
          cursor: pointer;
          text-align: left;
        }

        .security-action-button strong {
          margin-left: auto;
          min-width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: #0f766e;
          background: #ccfbf1;
        }

        .security-action-icon {
          width: 38px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          color: #0f766e;
          background: #e6fffb;
        }

        .security-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.48);
          backdrop-filter: blur(5px);
        }

        .security-modal {
          position: relative;
          width: min(520px, 96vw);
          max-height: 92vh;
          overflow: auto;
          border-radius: 24px;
          padding: 30px;
          background: #fff;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
        }

        .security-modal-narrow {
          width: min(430px, 96vw);
        }

        .security-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border: 0;
          border-radius: 999px;
          background: #f1f5f9;
          color: #0f172a;
          cursor: pointer;
        }

        .security-modal h2 {
          margin: 0 0 22px;
          color: #111827;
          font-size: 32px;
          line-height: 1.1;
        }

        .security-modal h3 {
          margin: 20px 0 10px;
          color: #6b7280;
          font-size: 13px;
        }

        .security-modal-copy {
          margin: 0 0 18px;
          max-width: 330px;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.45;
        }

        .security-device-list {
          display: grid;
          gap: 2px;
          border-top: 1px solid #eef2f7;
        }

        .security-device-row {
          display: grid;
          grid-template-columns: 42px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #eef2f7;
        }

        .security-device-icon {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: #0ea5e9;
          background: #eef7ff;
          font-size: 20px;
        }

        .security-device-info {
          display: grid;
          gap: 3px;
        }

        .security-device-info strong {
          color: #111827;
          font-size: 14px;
        }

        .security-device-info span,
        .security-device-info small {
          color: #6b7280;
          font-size: 12px;
        }

        .security-device-row button {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 9px 14px;
          background: #fff;
          color: #111827;
          font-weight: 700;
          cursor: pointer;
        }

        .security-device-row button:disabled {
          color: #94a3b8;
          cursor: default;
        }

        .security-primary-action {
          width: 100%;
          min-height: 52px;
          border: 0;
          border-radius: 12px;
          margin-top: 22px;
          background: #0f8cff;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
        }

        .password-modal {
          display: grid;
          gap: 18px;
        }

        .password-modal label {
          display: grid;
          gap: 10px;
          color: #111827;
          font-weight: 800;
        }

        .password-modal small {
          color: #a1a1aa;
          font-weight: 600;
        }

        .password-input-wrap {
          min-height: 58px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 12px;
          padding: 0 16px;
          color: #a1a1aa;
          background: #f1f5f9;
        }

        .password-input-wrap input {
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: #111827;
          font-size: 16px;
          font-weight: 700;
        }

        .password-input-wrap input::placeholder {
          color: #b6bbc5;
        }

        .security-form-message {
          margin: 0;
          color: #0f766e;
          font-weight: 700;
        }
      `}</style>
    </main>
  );
};

export default SecuriteCompte;
