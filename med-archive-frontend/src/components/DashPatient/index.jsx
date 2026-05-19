import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../assets/css/styles.css';
import telecharger1 from "../../assets/img/télécharger (1).jpeg";


const DashPatient = () => {
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

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
        localStorage.setItem('medarchive-sidebar', !isSidebarCollapsed ? 'collapsed' : 'expanded');
    };

    return (
        <div className="app">
            <Topbar
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                onToggleSidebar={toggleSidebar}
            />
            <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Sidebar />
                <main className="content patient-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashPatient;