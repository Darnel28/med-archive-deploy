import React, { useState } from 'react';

const ParametresAccueil = () => {
  // État local pour le formulaire
  const [formData, setFormData] = useState({
    prenom: 'John',
    nom: 'Doe',
    email: 'john.doe@email.com',
    telephone: '+229 00 00 00 00',
    sexe: 'homme',
    dateNaissance: '1994-07-23',
    adresse: 'Zogbo, Cotonou Rue 123'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'radio') {
      setFormData(prev => ({ ...prev, sexe: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Données enregistrées :', formData);
    // Ici, appelez votre API pour sauvegarder les modifications
    alert('Modifications enregistrées avec succès !');
  };

  const handleUploadPhoto = () => {
    // Implémenter la logique de téléversement
    alert('Fonctionnalité de téléversement à implémenter');
  };

  const handleDeleteAvatar = () => {
    alert('Supprimer la photo de profil');
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Paramètres du compte</h1>
      </section>

      <div className="settings-shell">
        {/* Menu latéral des paramètres */}
        <aside className="settings-nav-card">
          <h2>Configuration</h2>
          {/* <a className="settings-nav-item" href="/espacemedecin/profil">
            <i className="fa-regular fa-user"></i><span>Profil</span>
          </a> */}
          <a className="settings-nav-item active" href="/espacemedecin/parametres">
            <i className="fa-regular fa-user"></i><span>Modalites de paiment</span>
          </a>
          {/* <a className="settings-nav-item" href="/espacemedecin/securite-compte">
            <i className="fa-solid fa-lock"></i><span>Sécurité du compte</span>
          </a> */}
          {/* <a className="settings-nav-item" href="/espacemedecin/preferences-notifications">
            <i className="fa-regular fa-bell"></i><span>Modalites de paiment</span>
          </a> */}
          <a className="settings-nav-item" href="/espaceaccueil/contacts-medicaux">
            <i className="fa-regular fa-circle-check"></i><span>Contacts médicaux</span>
          </a>
        </aside>

    <form className="settings-form-grid" onSubmit={handleSubmit}>

  <label className="settings-field settings-field-full">
    <span>Service concerné</span>
    <input
      type="text"
      value="Pédiatrie"
      readOnly
    />
  </label>

  <label className="settings-field">
    <span>Tarif consultation (patient non assuré)</span>
    <input
      type="number"
      name="tarifNonAssure"
      placeholder="5000"
    />
  </label>

  <label className="settings-field">
    <span>Tarif consultation (patient assuré)</span>
    <input
      type="number"
      name="tarifAssure"
      placeholder="1000"
    />
  </label>

  <label className="settings-field">
    <span>Taux de prise en charge assurance (%)</span>
    <input
      type="number"
      name="priseEnCharge"
      placeholder="80"
      min="0"
      max="100"
    />
  </label>

  <label className="settings-field">
    <span>Mode de paiement accepté</span>
    <select name="modePaiement">
      <option>Espèces</option>
      <option>Mobile Money</option>
      <option>Carte bancaire</option>
      <option>Tous</option>
    </select>
  </label>

  {/* <label className="settings-field settings-field-full">
    <span>Informations complémentaires</span>
    <textarea
      rows="4"
      placeholder="Conditions particulières de paiement du service..."
    />
  </label> */}

  <div className="settings-submit-wrap settings-field-full">
    <button
      className="btn btn-solid settings-btn-compact"
      type="submit"
    >
      Enregistrer les modalités
    </button>
  </div>

</form>
      </div>
      <style>
        { `
        /* Carte du formulaire */
.settings-form-grid {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
}

/* Champs */
.settings-field input,
.settings-field select,
.settings-field textarea {
  border-radius: 12px;
  border: 1px solid #d9e2ec;
  padding: 12px 15px;
  width: 100%;
  transition: all 0.3s ease;
}

/* Focus */
.settings-field input:focus,
.settings-field select:focus,
.settings-field textarea:focus {
  outline: none;
  border-color: #24c0f1;
  box-shadow: 0 0 0 3px rgba(36, 192, 241, 0.15);
}

/* Bouton */
.settings-btn-compact {
  border-radius: 12px !important;
  padding: 12px 24px;
}

/* Menu latéral */
.settings-nav-card {
  border-radius: 20px;
  overflow: hidden;
}

/* Liens du menu */
.settings-nav-item {
  border-radius: 10px;
  margin: 6px;
}

/* Carte titre */
.page-title-card {
  border-radius: 20px;
}

      `  }
      </style>
    </main>
  );
};

export default ParametresAccueil;