import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarHopital from './SideBarHopital.jsx';
import TopbarHopital from './TopBarHopital.jsx';

import '../../assets/css/styles.css';
import '../../assets/css/styleMedecin.css';
import '../../assets/css/DashboardReceptionniste.css'; 
const DashHopital = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('medarchive-theme');
        return savedTheme === 'dark';
    });

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const savedState = localStorage.getItem('medarchive-sidebar');
        return savedState === 'collapsed';
    });

    useEffect(() => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('medarchive-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
        localStorage.setItem('medarchive-sidebar', !isSidebarCollapsed ? 'collapsed' : 'expanded');
    };

    return (
        <div className="app">
            <TopbarHopital
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onToggleSidebar={toggleSidebar}
            />
            <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <SidebarHopital />
                <main className="content doctor-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashHopital;