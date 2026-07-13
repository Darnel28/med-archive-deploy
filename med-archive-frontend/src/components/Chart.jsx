import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../api/client';
import '../assets/css/chart.css';

const avatar = (name) => `https://ui-avatars.com/api/?background=13c3b8&color=fff&name=${encodeURIComponent(name || 'M')}`;
const time = (value) => value ? new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

function ContactItem({ contact, active, onSelect }) {
  return <button className={`ma-contact-item ${active ? 'ma-active' : ''}`} onClick={() => onSelect(contact)}>
    <div className="ma-avatar-wrap"><img className="ma-contact-avatar" src={avatar(contact.name)} alt="" /></div>
    <div className="ma-contact-main"><div className="ma-contact-top"><h3 className="ma-contact-name">{contact.name}</h3></div><div className="ma-contact-subline"><span className="ma-contact-preview">{contact.role}</span></div></div>
  </button>;
}

export default function Chart({ isDarkMode }) {
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadContacts = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/chat/contacts');
      const list = data?.data || [];
      setContacts(list);
      setActive((current) => current && list.find((item) => item.id === current.id) ? current : list[0] || null);
    } catch {
      setError('Impossible de charger vos contacts autorisés.');
    } finally { setLoading(false); }
  }, []);

  const loadMessages = useCallback(async (contact) => {
    if (!contact) return setMessages([]);
    try {
      const { data } = await apiClient.get(`/chat/messages/${contact.id}`);
      setMessages(data?.data || []);
    } catch { setError('Impossible de charger cette conversation.'); }
  }, []);

  useEffect(() => { loadContacts(); }, [loadContacts]);
  useEffect(() => { loadMessages(active); }, [active, loadMessages]);
  useEffect(() => {
    const timer = window.setInterval(() => { if (active) loadMessages(active); }, 10000);
    return () => window.clearInterval(timer);
  }, [active, loadMessages]);

  const send = async () => {
    const body = input.trim();
    if (!body || !active) return;
    try {
      const { data } = await apiClient.post(`/chat/messages/${active.id}`, { body });
      setMessages((old) => [...old, data.data]);
      setInput('');
    } catch { setError("Le message n'a pas pu être envoyé."); }
  };

  const shownContacts = useMemo(() => contacts.filter((contact) => `${contact.name} ${contact.role}`.toLowerCase().includes(search.toLowerCase())), [contacts, search]);
  const isMine = (message) => Number(message.meta?.sender_id) !== Number(active?.id);

  return <main className={`ma-chat-shell ${isDarkMode ? 'ma-dark' : ''}`}>
    <aside className="ma-sidebar">
      <h1 className="ma-sidebar-title">Messages</h1>
      <label className="ma-search-box"><i className="fa-solid fa-magnifying-glass" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un contact..." /></label>
      <div className="ma-tabs"><button className="ma-tab-btn ma-active">Contacts liés</button></div>
      <ul className="ma-contact-list">{loading ? <li className="ma-empty-list">Chargement…</li> : shownContacts.length ? shownContacts.map((contact) => <ContactItem key={contact.id} contact={contact} active={active?.id === contact.id} onSelect={setActive} />) : <li className="ma-empty-list">Aucun contact autorisé</li>}</ul>
    </aside>
    <section className="ma-conversation">
      {active ? <>
        <header className="ma-conv-header"><div className="ma-conv-user"><div className="ma-avatar-wrap ma-header-avatar-wrap"><img className="ma-conv-avatar" src={avatar(active.name)} alt="" /></div><div><h2 className="ma-conv-title">{active.name}</h2><div className="ma-conv-status">{active.role}</div></div></div></header>
        <div className="ma-messages"><div className="ma-day-separator">Conversation sécurisée</div>{messages.map((message) => <div className={`ma-msg-row ${isMine(message) ? 'ma-out' : 'ma-in'}`} key={message.id}><div><div className="ma-msg-bubble"><div className="ma-msg-text">{message.body}</div><div className="ma-msg-meta"><span className="ma-msg-time-inline">{time(message.created_at)}</span></div></div></div></div>)}</div>
        <footer className="ma-composer"><input className="ma-message-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder="Tapez un message..." /><div className="ma-composer-right"><button className="ma-send-btn" onClick={send} aria-label="Envoyer"><i className="fa-solid fa-paper-plane" /></button></div></footer>
      </> : <div className="ma-empty-list">Sélectionnez un contact.</div>}
      {error && <div className="ma-empty-list">{error}</div>}
    </section>
  </main>;
}
