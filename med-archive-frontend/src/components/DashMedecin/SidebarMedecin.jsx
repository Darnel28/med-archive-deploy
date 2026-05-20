import React, { useState } from 'react';
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

      <div className={`sidebar-user-panel ${userPanelOpen ? 'open' : ''}`}>
        <img src="https://i.pravatar.cc/200?img=32" alt="Dr Alice" />
        <strong>Dr. Alice</strong>
        <span>Service: Medecine generale</span>
      </div>

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

        <div className="sidebar-profile">
          <img src="https://i.pravatar.cc/80?img=32" alt="Dr Alice" />
          <div>
            <strong>Dr. Alice</strong>
            <span>ID: MED-24-007</span>
          </div>
          <NavLink className="settings-link" to="/espacemedecin/parametres">
            <i className="fa-solid fa-gear"></i>
          </NavLink>
        </div>

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