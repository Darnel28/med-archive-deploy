import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import AvatarInitials from '../AvatarInitials.jsx';

function normalizeUser(value) {
  return value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || {};
}

const menuItems = [
  { to: '/espaceaccueil', label: 'Dashboard', icon: 'fa-house', end: true },
  { to: '/espaceaccueil/medecins', label: 'Medecins', icon: 'fa-user-doctor' },
  { to: '/espaceaccueil/patients', label: 'Patients', icon: 'fa-user-injured' },
  { to: '/espaceaccueil/transfert', label: 'Transfert', icon: 'fa-exchange-alt' },
  { to: '/espaceaccueil/rendez-vous', label: 'Rendez-vous', icon: 'fa-calendar' },
];

const SidebarAccueil = () => {
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
      name: user.name || 'Utilisateur',
      service: user.service?.nom || user.role?.nom || info.type_etablissement || 'Accueil',
      id: user.matricule || user.code || info.code_etablissement || user.id || '-',
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
        <span>Service: {profile.service}</span>
      </div>

      <div className="menu-block">
        {menuItems.map((item) => (
          <NavLink key={item.to} end={item.end} to={item.to} className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
            <i className={`fa-solid ${item.icon}`}></i><span>{item.label}</span>
          </NavLink>
        ))}

        <h4>Gestion du compte</h4>
        <div className="menu-block">
          <NavLink to="/espaceaccueil/notifications" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
            <i className="fa-regular fa-bell"></i><span>Notifications</span>
          </NavLink>
        </div>

        <div className="sidebar-profile">
          {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : <AvatarInitials name={profile.name} size={45} bgColor="#13c3b8" />}
          <div>
            <strong>{profile.name}</strong>
            {/* <span>ID: {profile.id}</span> */}
          </div>
          <NavLink className="settings-link" to="/espaceaccueil/parametres">
                          <i className="fa-solid fa-gear"></i>
                        </NavLink>
          <NavLink className="settings-link logout-link" to="/deconnexion" aria-label="Se deconnecter">
            <i className="fa-solid fa-right-from-bracket"></i>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default SidebarAccueil;
