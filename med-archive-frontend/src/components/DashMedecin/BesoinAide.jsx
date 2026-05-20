import React, { useState } from 'react';
import '../../assets/css/besoinAide.css';

const categories = [
  { id: 1, name: 'Démarrage', icon: 'fa-rocket', count: 5 },
  { id: 2, name: 'Sécurité', icon: 'fa-lock', count: 4 },
  { id: 3, name: 'Facturation', icon: 'fa-credit-card', count: 3 },
  { id: 4, name: 'Intégrations', icon: 'fa-plug', count: 6 }
];

const faqItems = [
  {
    q: "Objectif de connexion",
    a: "L'objectif est de vous permettre d'accéder à votre espace sécurisé pour gérer rendez-vous, publications et dossiers patients."
  },
  {
    q: "Quelles sont les options de connexion?",
    a: "Vous pouvez vous connecter via email/mot de passe, et bientôt via authentification à 2 facteurs et SSO si activé par votre structure."
  },
  {
    q: "Comment réinitialiser le mot de passe ?",
    a: "Allez sur la page de connexion, cliquez sur 'Mot de passe oublié' et suivez les instructions envoyées par email."
  },
  {
    q: "Comment changer le mot de passe ?",
    a: "Dans 'Sécurité du compte' cliquez sur 'Changer le mot de passe' et suivez le formulaire — le changement se fait sans créer de ticket."
  },
  {
    q: "D'où je peux me déconnecter ?",
    a: "Le bouton Déconnexion est disponible dans le menu utilisateur en haut à droite de l'interface."
  }
];

const BesoinAide = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: '', description: '', file: null });

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const openTicketModal = () => setShowTicketModal(true);
  const closeTicketModal = () => setShowTicketModal(false);

  const handleTicketChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') return setTicketForm(prev => ({ ...prev, file: files[0] }));
    setTicketForm(prev => ({ ...prev, [name]: value }));
  };

  const submitTicket = (e) => {
    e.preventDefault();
    console.log('Ticket soumis', ticketForm);
    alert('Ticket créé — notre équipe vous contactera.');
    setTicketForm({ title: '', description: '', file: null });
    closeTicketModal();
  };

  return (
    <main className="content page-tight besoin-aide-page">
      <div className="besoin-aide-header">
        <div className="besoin-aide-badge">✓ Questions Fréquentes</div>
        <h1>Besoin d'aide ?</h1>
        <h2>Nous avons les réponses</h2>
        <p>Tout ce que vous devez savoir sur notre plateforme, de la prise en main aux intégrations avancées.</p>
      </div>

      <section className="besoin-aide-shell">
        <div className="besoin-aide-container">
          {/* COLONNE GAUCHE - CATÉGORIES ET CTA */}
          <aside className="besoin-aide-sidebar">
            <div className="besoin-aide-categories">
              <h3>Parcourir par catégorie</h3>
              <div className="besoin-aide-category-list">
                {categories.map(cat => (
                  <div key={cat.id} className="besoin-aide-category-card">
                    <div className="besoin-aide-category-icon">
                      <i className={`fa-solid ${cat.icon}`}></i>
                    </div>
                    <div className="besoin-aide-category-content">
                      <h4>{cat.name}</h4>
                      <span className="besoin-aide-category-count">{cat.count} articles</span>
                    </div>
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOC CTA */}
            <div className="besoin-aide-cta-block">
              <h4>Vous avez toujours besoin d'aide ?</h4>
              <p>Impossible de trouver la réponse? Notre équipe de support est là pour vous aider.</p>
              <button className="besoin-aide-btn besoin-aide-btn-primary" onClick={openTicketModal}>
                Contacter le support
              </button>
            </div>
          </aside>

          {/* COLONNE DROITE - FAQ */}
          <div className="besoin-aide-main">
            <div className="besoin-aide-faq-grid">
              {faqItems.length > 0 ? (
                faqItems.map((item, i) => (
                  <article key={i} className={`besoin-aide-faq-card ${openIndex === i ? 'open' : ''}`}>
                    <button type="button" className="besoin-aide-faq-question" onClick={() => toggle(i)}>
                      <span>{item.q}</span>
                      <i className={`fa-solid ${openIndex === i ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </button>

                    {openIndex === i && (
                      <div className="besoin-aide-faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <article className="besoin-aide-faq-card">
                  <div className="besoin-aide-faq-answer">
                    <p>Aucune question n'a encore été ajoutée.</p>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      </section>

    {showTicketModal && (
  <div
    className="ticket-modal-overlay"
    role="dialog"
    aria-modal="true"
    onClick={closeTicketModal}
  >
    <div
      className="ticket-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="ticket-modal-header">
        <h2>Créer un ticket</h2>

        <button
          className="ticket-close-btn"
          onClick={closeTicketModal}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* FORM */}
      <form className="ticket-form" onSubmit={submitTicket}>
        {/* TITRE */}
        <div className="ticket-form-group">
          <label>
            Sujet <span>*</span>
          </label>

          <input
            type="text"
            name="title"
            placeholder="Brève description du problème"
            value={ticketForm.title}
            onChange={handleTicketChange}
            required
          />
        </div>

        {/* SELECTS */}
        <div className="ticket-form-row">
          <div className="ticket-form-group">
            <label>
              Catégorie <span>*</span>
            </label>

            <select>
              <option>Choisir une catégorie</option>
              <option>Connexion</option>
              <option>Sécurité</option>
              <option>Facturation</option>
              <option>Technique</option>
            </select>
          </div>

          <div className="ticket-form-group">
            <label>
              Priorité <span>*</span>
            </label>

            <select>
              <option>Choisir une priorité</option>
              <option>Faible</option>
              <option>Moyenne</option>
              <option>Élevée</option>
              <option>Urgente</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="ticket-form-group">
          <label>
            Description <span>*</span>
          </label>

          <textarea
            name="description"
            rows="6"
            placeholder="Veuillez donner le plus de détails possible..."
            value={ticketForm.description}
            onChange={handleTicketChange}
            required
          />
        </div>

        {/* UPLOAD */}
        <div className="ticket-form-group">
          <label>Pièces jointes</label>

          <label className="ticket-upload-box">
            <input
              type="file"
              name="file"
              onChange={handleTicketChange}
              hidden
            />

            <div className="ticket-upload-content">
              <i className="fa-solid fa-cloud-arrow-up"></i>

              <h4>Déposez vos fichiers ici</h4>

              <p>
                ou cliquez pour téléverser
              </p>

              <span>
                Taille max : 10MB • JPG, PNG, PDF, DOC
              </span>
            </div>
          </label>
        </div>

        {/* ACTIONS */}
        <div className="ticket-actions">
          <button
            type="button"
            className="ticket-btn ticket-btn-cancel"
            onClick={closeTicketModal}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="ticket-btn ticket-btn-submit"
          >
            <i className="fa-regular fa-paper-plane"></i>
            Soumettre
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </main>
  );
};

export default BesoinAide;
