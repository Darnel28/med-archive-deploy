import React from 'react';

const Profil = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Profil patient</h1>
      </section>

      <div className="profile-layout">
        {/* Carte d'identité */}
        <div className="profile-card profile-identity-card">
          <img src="https://i.pravatar.cc/80?img=12" alt="Photo de profil" className="profile-avatar-large" />
          <h2>Doe</h2>
          <h3>John</h3>
          <a href="tel:+22900000000" className="profile-contact-link">+229 00 00 00 00</a>
          <a href="mailto:john.doe@email.com" className="profile-contact-sub">john.doe@email.com</a>
        </div>

        {/* Carte Informations de base */}
        <div className="profile-card">
          <div className="profile-card-head">
            <h2>Informations de base du patient</h2>
            <i className="fa-solid fa-pen"></i>
          </div>
          <div className="profile-kv-grid">
            <div className="profile-kv-row"><span>Nom:</span><span className="profile-kv-value">Doe</span></div>
            <div className="profile-kv-row"><span>Prénom:</span><span className="profile-kv-value">John</span></div>
            <div className="profile-kv-row"><span>Date de naissance:</span><span className="profile-kv-value">23/07/1994</span></div>
            <div className="profile-kv-row"><span>Sexe:</span><span className="profile-kv-value">Masculin</span></div>
            <div className="profile-kv-row"><span>Téléphone:</span><span className="profile-kv-value">+229 00 00 00 00</span></div>
            <div className="profile-kv-row"><span>Email:</span><span className="profile-kv-value">john.doe@email.com</span></div>
            <div className="profile-kv-row"><span>Adresse / Ville:</span><span className="profile-kv-value">Zogbo, Cotonou Rue 123</span></div>
          </div>
        </div>

        {/* Carte Informations importantes */}
        <div className="profile-card">
          <div className="profile-card-head">
            <h2>Informations importantes</h2>
            <i className="fa-solid fa-stethoscope"></i>
          </div>
          <div className="profile-kv-grid">
            <div className="profile-kv-row"><span>Groupe sanguin:</span><span className="profile-kv-value">A+</span></div>
            <div className="profile-kv-row"><span>Allergies:</span><span className="profile-kv-value">Noix, pollen</span></div>
            <div className="profile-kv-row"><span>Maladies chroniques:</span><span className="profile-kv-value">Asthme</span></div>
            <div className="profile-kv-row"><span>Antécédents médicaux:</span><span className="profile-kv-value">COVID-19 (2022), fracture radius (2018)</span></div>
          </div>
        </div>

        {/* Carte Visites (futures & passées) */}
        <div className="profile-card profile-visits-card">
          <div className="profile-visits-tabs">
            <button className="active" type="button">Visites futures (2)</button>
            <button type="button">Visites passées (15)</button>
            <button type="button">Traitements prévus</button>
          </div>

          <div className="profile-visit-row purple">
            <div className="profile-visit-time">
              <span>11:00-12:30</span>
              <span className="profile-visit-value">26 Fév 2023</span>
            </div>
            <div className="profile-visit-col">
              <span>Service:</span>
              <span className="profile-visit-value">Traitement et nettoyage des canaux</span>
            </div>
            <div className="profile-visit-col">
              <span>Médecin:</span>
              <span className="profile-visit-value">Oksana Maxime</span>
            </div>
            <div className="profile-visit-status">
              <span>Statut:</span>
              <em>Programmé</em>
            </div>
          </div>

          <div className="profile-visit-row cyan">
            <div className="profile-visit-time">
              <span>11:00-12:30</span>
              <span className="profile-visit-value">27 Fév 2023</span>
            </div>
            <div className="profile-visit-col">
              <span>Service:</span>
              <span className="profile-visit-value">Blanchiment des dents</span>
            </div>
            <div className="profile-visit-col">
              <span>Médecin:</span>
              <span className="profile-visit-value">Max Oched</span>
            </div>
            <div className="profile-visit-status">
              <span>Statut:</span>
              <em>Programmé</em>
            </div>
          </div>
        </div>

        {/* Bloc latéral : Fichiers + Notes (stack de cartes) */}
        <div className="profile-side-stack">
          <div className="profile-card profile-file-card">
            <div className="profile-card-head profile-mini-head">
              <h2>Fichiers</h2>
              <button className="btn btn-outline btn-sm">Télécharger</button>
            </div>
            <ul className="profile-mini-list">
              <li><i className="fa-regular fa-file-lines"></i><span>Bilan de contrôle.pdf</span><span className="profile-file-size">123kb</span></li>
              <li><i className="fa-regular fa-file-lines"></i><span>Compte rendu de visite.pdf</span><span className="profile-file-size">123kb</span></li>
              <li><i className="fa-regular fa-file-lines"></i><span>Ordonnance médicale.pdf</span><span className="profile-file-size">123kb</span></li>
              <li><i className="fa-regular fa-file-lines"></i><span>Résultat laboratoire.pdf</span><span className="profile-file-size">123kb</span></li>
            </ul>
          </div>

          <div className="profile-card profile-file-card">
            <div className="profile-card-head profile-mini-head">
              <h2>Notes</h2>
              <button className="btn btn-outline btn-sm">Télécharger</button>
            </div>
            <ul className="profile-mini-list">
              <li><i className="fa-regular fa-note-sticky"></i><span>Note 31.06.23.pdf</span><span className="profile-file-size">123kb</span></li>
              <li><i className="fa-regular fa-note-sticky"></i><span>Note 23.06.23.pdf</span><span className="profile-file-size">123kb</span></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profil;