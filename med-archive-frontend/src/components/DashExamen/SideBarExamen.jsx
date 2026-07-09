import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import AvatarInitials from '../AvatarInitials.jsx';

function normalizeUser(value) {
    return value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || {};
}

const SidebarExamen = () => {
    const [userPanelOpen, setUserPanelOpen] = useState(false);
    const [user, setUser] = useState(() => normalizeUser(getAuthUser()));

    useEffect(() => {
        let mounted = true;

        getCurrentUser()
            .then((response) => {
                if (mounted) {
                    setUser(normalizeUser(response));
                }
            })
            .catch(() => { });

        return () => {
            mounted = false;
        };
    }, []);

    const profile = useMemo(() => {
        const info = user?.user || user;
        const institution = info?.laboratoire || info?.etablissement || info?.service || {};

        return {
            name: info?.name || info?.nom || 'Utilisateur examen',
            service:
                institution?.nom ||
                info?.role?.nom ||
                info?.role ||
                'Service examen',
            avatar: info?.avatar || null,
        };
    }, [user]);

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
                {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} />
                ) : (
                    <AvatarInitials name={profile.name} size={56} bgColor="#13c3b8" />
                )}
                <strong>{profile.name}</strong>
                <span>Service: {profile.service}</span>
            </div>

            <div className="menu-block">
                <NavLink end to="/espaceexamen" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-house"></i><span>Dashboard</span>
                </NavLink>

                <NavLink to="/espaceexamen/demandes" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-regular fa-envelope"></i><span>Demandes</span>
                </NavLink>

                <NavLink to="/espaceexamen/resultats" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-vial"></i><span>Résultats</span>
                </NavLink>

                {/* <NavLink to="/espaceexamen/transfert" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-history"></i><span>Historique</span>
                </NavLink> */}

                {/* <NavLink to="/espaceaccueil/rendez-vous" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
          <i className="fa-solid fa-calendar"></i><span>Rendez-vous</span>
        </NavLink> */}

                <h4>Gestion du compte</h4>
                <div className="menu-block">
                    {/* <a className="menu-item" href="/espacemedecin/publications">
            <i className="fa-regular fa-newspaper"></i><span>Publications</span>
          </a> */}
                    <NavLink to="/espaceexamen/alertes" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                        <i className="fa-regular fa-bell "></i><span>Alertes</span>
                    </NavLink>
                    {/* <NavLink to="/espaceexamen/profil" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                        <i className="fa-regular fa-user"></i><span>Profil</span>
                    </NavLink> */}
                </div>

                <div className="sidebar-profile">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} />
                    ) : (
                        <AvatarInitials name={profile.name} size={45} bgColor="#13c3b8" />
                    )}
                    <div>
                        <strong>{profile.name}</strong>
                        <span>{profile.service}</span>
                        {/* <span>ID: MED-24-007</span> */}
                    </div>
                     <NavLink className="settings-link" to="/espacemedecin/parametres">
                                                      <i className="fa-solid fa-gear"></i>
                                                    </NavLink>
                    <NavLink className="settings-link logout-link" to="/deconnexion" aria-label="Se déconnecter">
                                                     <i className="fa-solid fa-right-from-bracket"></i>
                                                   </NavLink>
                </div>

               <NavLink
                      to="/espaceexamen/besoin-aide"
                      className="sidebar-help"
                    >
                      <i className="fa-solid fa-headset"></i>
                      <span>Besoin d'aide ? Contacter le support</span>
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </NavLink>
            </div>
        </aside>
    );
};

export default SidebarExamen;