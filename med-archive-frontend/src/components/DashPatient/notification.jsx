import React, { useState } from 'react';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Exemple de données de notifications
  const notifications = {
    all: [
      { id: 1, icon: 'fa-solid fa-vial', iconClass: 'success', title: 'Nouveau Résultat d\'Analyse Disponible', desc: 'Votre résultat de prise de sang est disponible.', badge: 'Nouveau', time: 'Il y a 10 minutes' },
      { id: 2, icon: 'fa-solid fa-bell', iconClass: 'warning', title: 'Rappel : Consultation Cardio Demain', desc: 'Votre rendez-vous est prévu demain matin à 10h00.', badge: 'Nouveau', time: 'Il y a 4 heures' },
      { id: 3, icon: 'fa-solid fa-stethoscope', iconClass: 'danger', title: 'Compte Rendu de Consultation Ajouté', desc: 'Consultez le compte rendu de votre dernière consultation.', badge: 'Nouveau', time: 'Il y a 1 jour' },
      { id: 4, icon: 'fa-regular fa-file-lines', iconClass: '', title: 'Nouveau Document dans Votre Dossier', desc: 'Ordonnance de suivi ajoutée à votre dossier.', badge: null, time: 'Il y a 2 jours' },
      { id: 5, icon: 'fa-regular fa-envelope', iconClass: 'warning', title: 'Rappel : Prendre vos Médicaments', desc: 'N\'oubliez pas de prendre vos médicaments prescrits.', badge: null, time: 'Il y a 4 jours' },
      { id: 6, icon: 'fa-regular fa-file-arrow-down', iconClass: '', title: 'Document Téléchargé', desc: 'Vous avez téléchargé le fichier "resultats_2024.pdf".', badge: null, time: 'Il y a 6 jours' }
    ],
    unread: [
      { id: 1, icon: 'fa-solid fa-vial', iconClass: 'success', title: 'Nouveau Résultat d\'Analyse Disponible', desc: 'Votre résultat de prise de sang est disponible.', badge: 'Nouveau', time: 'Il y a 10 minutes' },
      { id: 2, icon: 'fa-solid fa-bell', iconClass: 'warning', title: 'Rappel : Consultation Cardio Demain', desc: 'Votre rendez-vous est prévu demain matin à 10h00.', badge: 'Nouveau', time: 'Il y a 4 heures' },
      { id: 3, icon: 'fa-solid fa-stethoscope', iconClass: 'danger', title: 'Compte Rendu de Consultation Ajouté', desc: 'Consultez le compte rendu de votre dernière consultation.', badge: 'Nouveau', time: 'Il y a 1 jour' }
    ],
    important: [
      { id: 2, icon: 'fa-solid fa-bell', iconClass: 'warning', title: 'Rappel : Consultation Cardio Demain', desc: 'Votre rendez-vous est prévu demain matin à 10h00.', badge: 'Nouveau', time: 'Il y a 4 heures' },
      { id: 5, icon: 'fa-regular fa-envelope', iconClass: 'warning', title: 'Rappel : Prendre vos Médicaments', desc: 'N\'oubliez pas de prendre vos médicaments prescrits.', badge: null, time: 'Il y a 4 jours' }
    ]
  };

  const getTabCount = (tabKey) => {
    if (tabKey === 'all') return notifications.all.length;
    if (tabKey === 'unread') return notifications.unread.length;
    if (tabKey === 'important') return notifications.important.length;
    return 0;
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Notifications</h1>
      </section>

      <div className="notif-panel">
        <div className="notif-tabs">
          <div className="notif-tabs-left">
            <button
              className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Toutes ({getTabCount('all')})
            </button>
            <button
              className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveTab('unread')}
            >
              Non lues ({getTabCount('unread')})
            </button>
            <button
              className={`notif-tab ${activeTab === 'important' ? 'active' : ''}`}
              onClick={() => setActiveTab('important')}
            >
              Importantes ({getTabCount('important')})
            </button>
          </div>
          <label className="table-search notif-search" aria-label="Recherche notifications">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Rechercher dans les notifications..." />
          </label>
        </div>

        <ul className="notif-list">
          {notifications[activeTab].map((notif) => (
            <li className="notif-item" key={notif.id}>
              <i className={`${notif.icon} notif-icon ${notif.iconClass}`}></i>
              <div className="notif-content">
                <strong>{notif.title}</strong>
                <p>{notif.desc}</p>
              </div>
              <span className="notif-meta">
                {notif.badge && <span className="notif-badge">{notif.badge}</span>}
                {notif.time}
              </span>
              <button className="notif-more" type="button" aria-label="Plus d'options">
                <i className="fa-solid fa-ellipsis"></i>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Notifications;