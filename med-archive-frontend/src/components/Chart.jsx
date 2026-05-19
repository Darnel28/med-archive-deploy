// Chart.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../assets/css/chart.css'; 

// Initial contacts data (same as before)
const INITIAL_CONTACTS = [
  {
    id: "sarah",
    name: "Patient Amina Diallo",
    avatar: "https://i.pravatar.cc/100?img=47",
    role: "Patiente suivie",
    email: "amina.diallo@example.com",
    phone: "+229 01 55 12 34 56",
    location: "Cotonou, Benin",
    online: true,
    group: false,
    time: "Il y a 2 min",
    unread: 0,
    preview: "Oui Docteur, j'ai bien recu le plan de traitement.",
    messages: [
      { from: "in", text: "Bonjour Docteur, j'ai encore une douleur legere au thorax ce matin.", time: "09:30" },
      { from: "out", text: "Bonjour Amina. J'ai consulte votre dossier sur DashMedecin: continuez le traitement et surveillez la tension aujourd'hui.", time: "09:32" },
      { from: "in", text: "D'accord. Est-ce que je peux reprendre mes activites sportives ?", time: "09:35" },
      { from: "out", text: "Pas encore. Repos 48h, puis reprise progressive selon vos constantes.", time: "09:37" },
      { from: "out", file: true, filename: "Ordonnance-Amina-Diallo.pdf", size: "1.2 MB", time: "09:37", seen: true }
    ]
  },
  {
    id: "mike",
    name: "Patient M. Johnson",
    avatar: "https://i.pravatar.cc/100?img=12",
    role: "Patient suivi",
    email: "m.johnson@example.com",
    phone: "+229 01 60 45 12 10",
    location: "Porto-Novo, Benin",
    online: false,
    group: false,
    time: "Il y a 15 min",
    unread: 2,
    preview: "Docteur, j'ai televerse mes analyses sanguines.",
    messages: [
      { from: "in", text: "Docteur, j'ai televerse mes analyses sanguines.", time: "08:50" },
      { from: "out", text: "Bien recu. Je vous fais un retour dans l'apres-midi.", time: "08:57" }
    ]
  },
  {
    id: "emily",
    name: "Patient Emily Davis",
    avatar: "https://i.pravatar.cc/100?img=32",
    role: "Patiente suivie",
    email: "emily.davis@example.com",
    phone: "+229 01 72 88 43 20",
    location: "Abomey-Calavi, Benin",
    online: true,
    group: false,
    time: "Il y a 1 h",
    unread: 1,
    preview: "Docteur, j'ai oublie ma dose d'hier soir.",
    messages: [
      { from: "in", text: "Docteur, j'ai oublie ma dose d'hier soir. Je fais quoi aujourd'hui ?", time: "08:04" }
    ]
  },
  {
    id: "team",
    name: "Equipe soignante",
    avatar: "https://i.pravatar.cc/100?img=68",
    role: "Coordination clinique",
    email: "equipe.soins@medarchive.bj",
    phone: "+229 01 90 00 00 00",
    location: "Clinique MedArchive, Cotonou",
    online: true,
    group: true,
    time: "Il y a 2 h",
    unread: 0,
    preview: "Infirmier Alex : Tension patient Amina stable.",
    messages: [
      { from: "in", text: "Infirmier Alex : Tension patient Amina stable.", time: "07:21" },
      { from: "out", text: "Parfait. On maintient le protocole et on reevalue ce soir.", time: "07:30" }
    ]
  },
  {
    id: "david",
    name: "Patient David Brown",
    avatar: "https://i.pravatar.cc/100?img=20",
    role: "Patient suivi",
    email: "david.brown@example.com",
    phone: "+229 01 33 10 15 90",
    location: "Parakou, Benin",
    online: false,
    group: false,
    time: "Hier",
    unread: 0,
    preview: "Merci Docteur, la douleur a diminue.",
    messages: [
      { from: "in", text: "Merci Docteur, la douleur a diminue depuis hier.", time: "Hier" }
    ]
  },
  {
    id: "lisa",
    name: "Patient Lisa Anderson",
    avatar: "https://i.pravatar.cc/100?img=16",
    role: "Patiente suivie",
    email: "lisa.anderson@example.com",
    phone: "+229 01 44 28 90 02",
    location: "Ouidah, Benin",
    online: false,
    group: false,
    time: "Hier",
    unread: 0,
    preview: "Je confirme mon rendez-vous de suivi lundi.",
    messages: [
      { from: "in", text: "Je confirme mon rendez-vous de suivi lundi.", time: "Hier" }
    ]
  }
];

const AUTO_REPLIES = [
  "Parfait, je mets a jour votre dossier dans DashMedecin.",
  "Bien recu. Continuez le traitement et surveillez les symptomes.",
  "Merci, je viens de consulter vos derniers resultats.",
  "Entendu, je vous envoie une consigne medicale detaillee.",
  "Tres bien, on fait un point lors du prochain controle."
];

const getNowTime = () => {
  return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const formatMessageText = (text) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const lines = [];
  for (let i = 0; i < words.length; i += 12) {
    const chunk = words.slice(i, i + 12).join(" ");
    lines.push(escapeHtml(chunk));
  }
  return lines.join("<br>");
};

const escapeHtml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
};

// Components with prefixed class names
const ContactItem = ({ contact, isActive, onClick }) => {
  const presenceClass = contact.online ? "ma-online" : "ma-offline";
  return (
    <button className={`ma-contact-item ${isActive ? "ma-active" : ""}`} onClick={() => onClick(contact.id)}>
      <div className="ma-avatar-wrap">
        <img className="ma-contact-avatar" src={contact.avatar} alt={`Avatar de ${contact.name}`} />
        <span className={`ma-avatar-presence ${presenceClass}`}></span>
      </div>
      <div className="ma-contact-main">
        <div className="ma-contact-top">
          <h3 className="ma-contact-name">{contact.name}</h3>
          <span className="ma-contact-time">{contact.time}</span>
        </div>
        <div className="ma-contact-subline">
          <span className="ma-contact-preview">{contact.preview}</span>
        </div>
      </div>
      {contact.unread > 0 && <span className="ma-badge">{contact.unread}</span>}
    </button>
  );
};

const Message = ({ msg, contact }) => {
  if (msg.file) {
    return (
      <div className="ma-msg-row ma-out">
        <div>
          <div className="ma-file-card">
            <span className="ma-file-icon"><i className="fa-regular fa-file-pdf"></i></span>
            <div className="ma-file-meta">
              <div className="ma-file-name">{msg.filename}</div>
              <div className="ma-file-size">{msg.size}</div>
              <div className="ma-file-footer">
                <span>{msg.time}</span>
                {msg.seen && <span className="ma-file-seen"><i className="fa-solid fa-check"></i> Vu</span>}
              </div>
            </div>
            <button className="ma-download-btn" onClick={() => alert(`Téléchargement de ${msg.filename}`)}>
              <i className="fa-solid fa-download"></i>
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (msg.from === "out") {
    return (
      <div className="ma-msg-row ma-out">
        <div>
          <div className="ma-msg-bubble">
            <div className="ma-msg-text" dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
            <div className="ma-msg-meta">
              <span className="ma-msg-time-inline">{msg.time}</span>
              <i className="fa-solid fa-check ma-msg-check" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ma-msg-row ma-in">
      <img className="ma-msg-avatar" src={contact.avatar} alt={`Avatar de ${contact.name}`} />
      <div>
        <div className="ma-msg-bubble">
          <div className="ma-msg-text" dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }} />
          <div className="ma-msg-meta">
            <span className="ma-msg-time-inline">{msg.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationHeader = ({ contact, onBack, onOpenInfo, onToggleMenu, isMenuOpen }) => {
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && isMenuOpen) {
        onToggleMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, onToggleMenu]);
  
  return (
    <header className="ma-conv-header">
      <div className="ma-conv-user">
        <button className="ma-back-btn" onClick={onBack} aria-label="Retour aux discussions">
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="ma-avatar-wrap ma-header-avatar-wrap">
          <img className="ma-conv-avatar" src={contact.avatar} alt={`Avatar de ${contact.name}`} />
          <span className={`ma-avatar-presence ${contact.online ? "ma-online" : "ma-offline"}`}></span>
        </div>
        <div>
          <h2 className="ma-conv-title">{contact.name}</h2>
          <div className="ma-conv-status">
            <span className={`ma-dot ${contact.online ? "ma-online" : ""}`}></span>
            <span>{contact.online ? "En ligne" : "Hors ligne"}</span>
          </div>
        </div>
      </div>
      <div className="ma-conv-actions">
        <button className="ma-icon-btn" onClick={() => alert("Appel vocal")}>
          <i className="fa-solid fa-phone"></i>
        </button>
        <button className="ma-icon-btn" onClick={() => alert("Visioconférence")}>
          <i className="fa-solid fa-video"></i>
        </button>
        <button className="ma-icon-btn" onClick={onOpenInfo}>
          <i className="fa-solid fa-circle-info"></i>
        </button>
        <button className="ma-icon-btn" onClick={() => onToggleMenu(!isMenuOpen)}>
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
        {isMenuOpen && (
          <div className="ma-chat-menu open" ref={menuRef}>
            <ul className="ma-chat-menu-group">
              <li><button className="ma-chat-menu-item" onClick={() => alert("Rechercher")}><i className="fa-solid fa-magnifying-glass"></i> Rechercher</button></li>
              <li><button className="ma-chat-menu-item" onClick={() => alert("Silencieux")}><i className="fa-regular fa-bell-slash"></i> Silencieux</button></li>
              <li><button className="ma-chat-menu-item" onClick={() => alert("Epinglé")}><i className="fa-solid fa-thumbtack"></i> Epinglé</button></li>
            </ul>
            <ul className="ma-chat-menu-group">
              <li><button className="ma-chat-menu-item" onClick={() => alert("Archivé")}><i className="bi bi-archive"></i> Archivé</button></li>
              <li><button className="ma-chat-menu-item ma-danger" onClick={() => alert("Supprimer")}><i className="fa-regular fa-trash-can"></i> Supprimer</button></li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

const MessageList = ({ messages, contact }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="ma-messages">
      <div className="ma-day-separator">Aujourd'hui</div>
      {messages.map((msg, idx) => (
        <Message key={idx} msg={msg} contact={contact} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

const Composer = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState("");
  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <footer className="ma-composer">
      <button className="ma-attach-btn" onClick={() => alert("Joindre un fichier")}>
        <i className="fa-solid fa-paperclip"></i>
      </button>
      <button className="ma-attach-btn" onClick={() => alert("Ajouter une image")}>
        <i className="fa-regular fa-image"></i>
      </button>
      <input
        className="ma-message-input"
        type="text"
        placeholder="Tapez un message..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="ma-composer-right">
        <button className="ma-emoji-btn" onClick={() => alert("Emoticones")}>
          <i className="fa-regular fa-face-smile"></i>
        </button>
        <button className="ma-send-btn" onClick={handleSend}>
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </footer>
  );
};

const ContactInfoPanel = ({ contact, isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <aside className="ma-contact-info">
      <div className="ma-contact-info-header">
        <h3>Contact Info</h3>
        <button className="ma-close-info-btn" onClick={onClose}>×</button>
      </div>
      <div className="ma-contact-info-body">
        <div className="ma-contact-hero">
          <img src={contact.avatar} alt={`Photo de ${contact.name}`} />
          <h4>{contact.name}</h4>
          <p className="ma-contact-role">{contact.role || "Contact"}</p>
        </div>
        <p className="ma-section-label">Contact Details</p>
        <ul className="ma-details-list">
          <li><i className="fa-regular fa-envelope"></i><span>{contact.email || "-"}</span></li>
          <li><i className="fa-solid fa-phone"></i><span>{contact.phone || "-"}</span></li>
          <li><i className="fa-solid fa-location-dot"></i><span>{contact.location || "-"}</span></li>
        </ul>
        <p className="ma-section-label">Shared Media</p>
        <div className="ma-media-grid">
          <img src="https://picsum.photos/id/20/100/100" alt="Media 1" />
          <img src="https://picsum.photos/id/21/100/100" alt="Media 2" />
          <img src="https://picsum.photos/id/22/100/100" alt="Media 3" />
          <img src="https://picsum.photos/id/23/100/100" alt="Media 4" />
          <img src="https://picsum.photos/id/24/100/100" alt="Media 5" />
          <img src="https://picsum.photos/id/25/100/100" alt="Media 6" />
        </div>
        <p className="ma-section-label">Shared Files</p>
        <div className="ma-shared-files">
          <article className="ma-shared-file-item">
            <span className="ma-shared-file-icon"><i className="fa-regular fa-file-pdf"></i></span>
            <div className="ma-shared-file-meta">
              <div className="ma-shared-file-name">Dashboard-Design.pdf</div>
              <div className="ma-shared-file-size">2.4 MB</div>
            </div>
            <button className="ma-shared-download" onClick={() => alert("Téléchargement Dashboard-Design.pdf")}>
              <i className="fa-solid fa-download"></i>
            </button>
          </article>
          <article className="ma-shared-file-item">
            <span className="ma-shared-file-icon"><i className="fa-regular fa-file-zipper"></i></span>
            <div className="ma-shared-file-meta">
              <div className="ma-shared-file-name">Assets.zip</div>
              <div className="ma-shared-file-size">15.8 MB</div>
            </div>
            <button className="ma-shared-download" onClick={() => alert("Téléchargement Assets.zip")}>
              <i className="fa-solid fa-download"></i>
            </button>
          </article>
        </div>
      </div>
    </aside>
  );
};

const Sidebar = ({ contacts, activeTab, onTabChange, searchQuery, onSearchChange, onContactSelect, activeContactId, totalUnread }) => {
  const filteredContacts = contacts.filter(contact => {
    const tabPass = activeTab === "all" ||
      (activeTab === "unread" && contact.unread > 0) ||
      (activeTab === "groups" && contact.group);
    const searchPass = !searchQuery || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      contact.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return tabPass && searchPass;
  });
  return (
    <aside className="ma-sidebar">
      <h1 className="ma-sidebar-title">Messages</h1>
      <label className="ma-search-box">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>
      <div className="ma-tabs">
        <button className={`ma-tab-btn ${activeTab === "all" ? "ma-active" : ""}`} onClick={() => onTabChange("all")}>
          Tous
        </button>
        <button className={`ma-tab-btn ${activeTab === "unread" ? "ma-active" : ""}`} onClick={() => onTabChange("unread")}>
          Non lus <span className="ma-unread-count">{totalUnread}</span>
        </button>
        <button className={`ma-tab-btn ${activeTab === "groups" ? "ma-active" : ""}`} onClick={() => onTabChange("groups")}>
          Groupes
        </button>
      </div>
      <ul className="ma-contact-list">
        {filteredContacts.length === 0 ? (
          <li className="ma-empty-list">Aucune conversation trouvée</li>
        ) : (
          filteredContacts.map(contact => (
            <ContactItem
              key={contact.id}
              contact={contact}
              isActive={contact.id === activeContactId}
              onClick={onContactSelect}
            />
          ))
        )}
      </ul>
    </aside>
  );
};

function Chart() {
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContactId, setActiveContactId] = useState("sarah");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 980px)");
  const autoReplyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (autoReplyTimeoutRef.current) clearTimeout(autoReplyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileChatOpen(true);
    } else {
      setIsMobileChatOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === activeContactId && contact.unread > 0
          ? { ...contact, unread: 0 }
          : contact
      )
    );
  }, [activeContactId]);

  const totalUnread = contacts.reduce((sum, c) => sum + (c.unread || 0), 0);
  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];

  const updateContact = useCallback((contactId, updater) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? updater(contact) : contact
    ));
  }, []);

  const sendMessage = useCallback((text) => {
    const nowTime = getNowTime();
    const contact = activeContact;
    const newMessage = { from: "out", text, time: nowTime };
    updateContact(contact.id, (c) => ({
      ...c,
      messages: [...c.messages, newMessage],
      preview: text,
      time: "À l'instant"
    }));
    if (autoReplyTimeoutRef.current) clearTimeout(autoReplyTimeoutRef.current);
    autoReplyTimeoutRef.current = setTimeout(() => {
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyTime = getNowTime();
      const replyMessage = { from: "in", text: replyText, time: replyTime };
      updateContact(contact.id, (c) => ({
        ...c,
        messages: [...c.messages, replyMessage],
        preview: replyText,
        time: "À l'instant"
      }));
    }, 700);
  }, [activeContact, updateContact]);

  const selectContact = (contactId) => {
    setActiveContactId(contactId);
    setIsMenuOpen(false);
    if (isMobile) setIsMobileChatOpen(true);
  };

  const handleBack = () => {
    setIsMobileChatOpen(false);
    setIsInfoOpen(false);
    setIsMenuOpen(false);
  };

  const handleOpenInfo = () => {
    if (isMobile && !isMobileChatOpen) setIsMobileChatOpen(true);
    setIsMenuOpen(false);
    setIsInfoOpen(true);
  };

  const getShellClass = () => {
    let classes = "ma-chat-shell";
    if (isMobile && isMobileChatOpen) classes += " ma-mobile-chat-open";
    if (isInfoOpen) classes += " ma-info-open";
    return classes;
  };

  return (
    <main className={getShellClass()}>
      <Sidebar
        contacts={contacts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onContactSelect={selectContact}
        activeContactId={activeContactId}
        totalUnread={totalUnread}
      />
      <section className="ma-conversation">
        <ConversationHeader
          contact={activeContact}
          onBack={handleBack}
          onOpenInfo={handleOpenInfo}
          onToggleMenu={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
        />
        <MessageList messages={activeContact?.messages || []} contact={activeContact} />
        <Composer onSendMessage={sendMessage} />
      </section>
      <ContactInfoPanel contact={activeContact} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </main>
  );
}

export default Chart;