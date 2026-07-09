import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import AvatarInitials from '../AvatarInitials.jsx';

const SidebarAdmin = () => {
    const [userPanelOpen, setUserPanelOpen] = useState(false);
    const auth = getAuthUser() || {};
    const user = auth.user || auth;
    const name = user.name || 'Administrateur';
    const role = user.role?.nom || auth.role?.nom || 'Administrateur';
    const avatar = user.avatar || auth.avatar || null;

    const toggleUserPanel = () => setUserPanelOpen(prev => !prev);

    return (
        <aside className="sidebar">
            <div className="sidebar-title-row">
                <h3>Administration</h3>
                <button
                    className="sidebar-user-toggle"
                    onClick={toggleUserPanel}
                    aria-expanded={userPanelOpen}
                >
                    <i className="fa-regular fa-user"></i>
                </button>
            </div>

            <div className={`sidebar-user-panel ${userPanelOpen ? 'open' : ''}`}>
                {avatar ? <img src={avatar} alt="Administrateur" /> : <AvatarInitials name={name} size={54} bgColor="#13c3b8" />}
                <strong>{name}</strong>
                <span>{role}</span>
            </div>

            <div className="menu-block">
                <NavLink end to="/espaceadmin" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-house"></i><span>Dashboard</span>
                </NavLink>

                <NavLink to="/espaceadmin/utilisateurs" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-users"></i><span>Utilisateurs</span>
                </NavLink>

                <NavLink to="/espaceadmin/hopitaux" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-hospital"></i><span>Hopitaux</span>
                </NavLink>

                <NavLink to="/espaceadmin/services" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-clipboard-list"></i><span>Services</span>
                </NavLink>

                <NavLink to="/espaceadmin/laboratoires" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-vial"></i><span>Laboratoires</span>
                </NavLink>

                <h4>Pilotage</h4>

                <NavLink to="/espaceadmin/rapports-admin" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-chart-line"></i><span>Rapports</span>
                </NavLink>

                <NavLink to="/espaceadmin/notifications-admin" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-bell"></i><span>Notifications</span>
                </NavLink>

                {/* <NavLink to="/espaceadmin/parametres" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
                    <i className="fa-solid fa-gear"></i><span>Parametres</span>
                </NavLink> */}

                <div className="sidebar-profile">
                    {avatar ? <img src={avatar} alt="Administrateur" /> : <AvatarInitials name={name} size={42} bgColor="#13c3b8" />}
                    <div>
                        <strong>{name}</strong>
                        <span>{role}</span>
                    </div>
                 
                     <NavLink className="settings-link" to="/espacemedecin/parametres-admin">
                                   <i className="fa-solid fa-gear"></i>
                                 </NavLink>
                   <NavLink className="settings-link logout-link" to="/deconnexion" aria-label="Se déconnecter">
                                  <i className="fa-solid fa-right-from-bracket"></i>
                                </NavLink>
                </div>

                {/* <a className="sidebar-help" href="/espaceadmin/rapports">
                    <i className="fa-solid fa-headset"></i>
                    <span>Supervision et support</span>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </a> */}
            </div>
        </aside>
    );
};

export default SidebarAdmin;
