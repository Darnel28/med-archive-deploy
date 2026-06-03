import React, { useState } from 'react';
import { getAuthUser } from '../../api/client';
import AvatarInitials from '../AvatarInitials.jsx';
import { NavLink } from 'react-router-dom';

const SidebarMedecin = () => {
  const [userPanelOpen, setUserPanelOpen] = useState(false);

  const toggleUserPanel = () => setUserPanelOpen(prev => !prev);

  return (
    <aside className="sidebar">
      <div className="sidebar-title-row">
        <h3>Navigation</h3>
        <button
          className="sidebar-user-toggle"
          onClick={toggleUserPanel}
          aria-expanded={userPanelOpen}
        >
          <i className="fa-regular fa-user"></i>
        </button>
      </div>

      {(() => {
        const auth = getAuthUser() || {};
        const name = auth?.name || auth?.user?.name || '—';
        const service = auth?.service || auth?.user?.service || '—';
        const avatar = auth?.avatar || auth?.user?.avatar || null;

        return (
          <div className={`sidebar-user-panel ${userPanelOpen ? 'open' : ''}`}>
            {avatar ? (
              <img src={avatar} alt={name} />
            ) : (
              <AvatarInitials name={name} size={56} bgColor="#13c3b8" />
            )}
            <strong>{name}</strong>
            <span>Service: {service}</span>
          </div>
        );
      })()}

      <div className="menu-block">
        <NavLink end to="/espacemedecin" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-house"></i><span>Dashboard</span>
        </NavLink>
        <NavLink to="/espacemedecin/rendez-vous" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-regular fa-calendar"></i><span>Mes rendez-vous</span>
        </NavLink>
        <NavLink to="/espacemedecin/patients" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-users"></i><span>Mes patients</span>
        </NavLink>
        <NavLink to="/espacemedecin/consultations" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-stethoscope"></i><span>Mes consultations</span>
        </NavLink>
        <NavLink to="/espacemedecin/examens" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-flask"></i><span>Examens</span>
        </NavLink>

        <h4>Gestion du compte</h4>
        <div className="menu-block">
          <NavLink to="/espacemedecin/publications" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
            <i className="fa-regular fa-newspaper"></i><span>Publications</span>
          </NavLink>
          <NavLink to="/espacemedecin/notifications" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
            <i className="fa-regular fa-bell"></i><span>Notifications</span>
          </NavLink>
          <NavLink to="/espacemedecin/profil" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
            <i className="fa-regular fa-user"></i><span>Profil</span>
          </NavLink>
        </div>

        {(() => {
          const auth = getAuthUser() || {};
          const name = auth?.name || auth?.user?.name || '—';
          const avatar = auth?.avatar || auth?.user?.avatar || null;
          // Try multiple possible id fields
          const idDisplay = auth?.numero_professionnel || auth?.medecin_id || auth?.id || auth?.user?.id || '—';

          return (
            <div className="sidebar-profile">
              {avatar ? (
                <img src={avatar} alt={name} />
              ) : (
                <AvatarInitials name={name} size={45} bgColor="#13c3b8" />
              )}
              <div>
                <strong>{name}</strong>
                <span>IMU: {idDisplay}</span>
              </div>
              <NavLink className="settings-link" to="/espacemedecin/parametres">
                <i className="fa-solid fa-gear"></i>
              </NavLink>
              <NavLink className="settings-link logout-link" to="/deconnexion" aria-label="Se déconnecter">
                <i className="fa-solid fa-right-from-bracket"></i>
              </NavLink>
            </div>
          );
        })()}

        <NavLink to="/espacemedecin/besoin-aide" className={({ isActive }) => `sidebar-help menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-headset"></i>
          <span>Besoin d'aide ?</span>
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
        </NavLink>
      </div>
    </aside>
  );
};

export default SidebarMedecin;