import React, { useEffect, useMemo, useState } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../api';

const importantTypes = new Set(['transfert_demande', 'transfert_refuse', 'consultation_annulee', 'resultat_examen']);

function unwrapRows(response) {
  const payload = response?.data ?? response;
  const page = payload?.data ?? payload;
  return Array.isArray(page?.data) ? page.data : Array.isArray(page) ? page : [];
}

function iconFor(type) {
  if (type?.startsWith('transfert')) return 'fa-solid fa-right-left';
  if (type?.startsWith('consultation')) return 'fa-solid fa-stethoscope';
  if (type?.includes('examen') || type?.includes('analyse')) return 'fa-solid fa-vial';
  return 'fa-regular fa-bell';
}

function timeLabel(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function DynamicNotifications({ title = 'Notifications' }) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadNotifications({ silent = false } = {}) {
    if (!silent) setLoading(true);
    try {
      const response = await getNotifications({ per_page: 100 });
      setNotifications(unwrapRows(response));
      setUnreadCount(response?.unread_count ?? 0);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger les notifications.');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(() => loadNotifications({ silent: true }), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredNotifications = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notifications.filter((notification) => {
      if (activeTab === 'unread' && notification.read_at) return false;
      if (activeTab === 'important' && !importantTypes.has(notification.type)) return false;
      if (!term) return true;
      return [notification.title, notification.body, notification.type].join(' ').toLowerCase().includes(term);
    });
  }, [activeTab, notifications, search]);

  async function handleMarkRead(id) {
    await markNotificationRead(id);
    await loadNotifications({ silent: true });
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    await loadNotifications({ silent: true });
  }

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>{title}</h1>
      </section>

      <div className="notif-panel">
        <div className="notif-tabs">
          <div className="notif-tabs-left">
            <button className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('all')}>
              Toutes ({notifications.length})
            </button>
            <button className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('unread')}>
              Non lues ({unreadCount})
            </button>
            <button className={`notif-tab ${activeTab === 'important' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('important')}>
              Importantes ({notifications.filter((notification) => importantTypes.has(notification.type)).length})
            </button>
          </div>
          <label className="table-search notif-search" aria-label="Recherche notifications">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Rechercher dans les notifications..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <button className="btn transfer-add-btn" type="button" disabled={unreadCount === 0} onClick={handleMarkAllRead}>
            Tout marquer lu
          </button>
        </div>

        {error ? <p className="alert alert-danger">{error}</p> : null}
        {loading ? <p className="table-meta p-4">Chargement...</p> : null}

        <ul className="notif-list">
          {!loading && filteredNotifications.length === 0 ? (
            <li className="notif-item">Aucune notification.</li>
          ) : null}
          {filteredNotifications.map((notification) => (
            <li className={`notif-item ${notification.read_at ? '' : 'is-unread'}`} key={notification.id}>
              <i className={`${iconFor(notification.type)} notif-icon ${importantTypes.has(notification.type) ? 'warning' : ''}`}></i>
              <div className="notif-content">
                <strong>{notification.title}</strong>
                <p>{notification.body || '-'}</p>
              </div>
              <span className="notif-meta">
                {!notification.read_at && <span className="notif-badge">Nouveau</span>}
                {timeLabel(notification.created_at)}
              </span>
              {!notification.read_at && (
                <button className="notif-more" type="button" aria-label="Marquer comme lue" onClick={() => handleMarkRead(notification.id)}>
                  <i className="fa-solid fa-check"></i>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
