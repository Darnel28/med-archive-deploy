import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import AvatarInitials from '../AvatarInitials.jsx';

function normalizeUser(value) {
  return value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || {};
}

const menuItems = [
  { to: '/espacehopital', label: 'Dashboard', icon: 'fa-house', end: true },
  { to: '/espacehopital/tout-les-medecins', label: 'Medecins', icon: 'fa-user-doctor' },
  { to: '/espacehopital/patients', label: 'Patients', icon: 'fa-user-injured' },
  { to: '/espacehopital/transfert', label: 'Transfert', icon: 'fa-exchange-alt' },
  { to: '/espacehopital/rapports', label: 'Rapports', icon: 'fa-file-medical' },
];

const SidebarHopital = () => {
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [user, setUser] = useState(() => normalizeUser(getAuthUser()));

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((response) => {
        if (mounted) setUser(normalizeUser(response));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const profile = useMemo(() => {
    const info = user.information_etablissement || user.informationEtablissement || {};
    return {
      name: user.name || 'Hopital',
      service: info.type_etablissement || user.role?.nom || 'Etablissement',
      id: info.code_etablissement || user.matricule || user.id || '-',
      avatar: user.avatar || null,
    };
  }, [user]);

  return (
    <aside className="sidebar">
      <div className="sidebar-title-row">
        <h3>Navigation</h3>
        <button className="sidebar-user-toggle" type="button" onClick={() => setUserPanelOpen((prev) => !prev)} aria-expanded={userPanelOpen}>
          <i className="fa-regular fa-user"></i>
        </button>
      </div>

      <div className={`sidebar-user-panel ${userPanelOpen ? 'open' : ''}`}>
        {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : <AvatarInitials name={profile.name} size={56} bgColor="#13c3b8" />}
        <strong>{profile.name}</strong>
        <span>Type: {profile.service}</span>
      </div>

      <div className="menu-block">
        {menuItems.map((item) => (
          <NavLink key={item.to} end={item.end} to={item.to} className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
            <i className={`fa-solid ${item.icon}`}></i><span>{item.label}</span>
          </NavLink>
        ))}

        <h4>Gestion du compte</h4>
        <div className="menu-block">
          <NavLink to="/espacehopital/notifications" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
            <i className="fa-regular fa-bell"></i><span>Alertes</span>
          </NavLink>
        </div>

        <div className="sidebar-profile">
          {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : <AvatarInitials name={profile.name} size={45} bgColor="#13c3b8" />}
          <div>
            <strong>{profile.name}</strong>
            <span>ID: {profile.id}</span>
          </div>
          <NavLink className="settings-link logout-link" to="/deconnexion" aria-label="Se deconnecter">
            <i className="fa-solid fa-right-from-bracket"></i>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default SidebarHopital;
