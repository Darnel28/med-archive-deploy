import React, { useState } from 'react';

const Parametres = () => {
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
          <a className="settings-nav-item" href="/espacepatient/profil">
            <i className="fa-regular fa-user"></i><span>Profil</span>
          </a>
          <a className="settings-nav-item active" href="/espacepatient/parametres">
            <i className="fa-regular fa-user"></i><span>Paramètres du profil</span>
          </a>
          <a className="settings-nav-item" href="/espacepatient/securite-compte">
            <i className="fa-solid fa-lock"></i><span>Sécurité du compte</span>
          </a>
          <a className="settings-nav-item" href="/espacepatient/preferences-notifications">
            <i className="fa-regular fa-bell"></i><span>Notifications</span>
          </a>
          <a className="settings-nav-item" href="/espacepatient/contacts-medicaux">
            <i className="fa-regular fa-circle-check"></i><span>Contacts médicaux</span>
          </a>
        </aside>

        {/* Carte principale du formulaire */}
        <article className="settings-main-card">
          <div className="settings-profile-head">
            <div className="settings-avatar-wrap">
              <img
                src="https://i.pravatar.cc/300?img=12"
                alt="Avatar"
                className="settings-avatar"
              />
              <button
                className="settings-avatar-camera"
                type="button"
                title="Modifier la photo"
                onClick={handleUploadPhoto}
              >
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>
            <div className="settings-avatar-actions">
              <button className="btn btn-solid settings-btn-compact" type="button" onClick={handleUploadPhoto}>
                Téléverser une photo
              </button>
              <button className="btn btn-outline settings-btn-compact" type="button" onClick={handleDeleteAvatar}>
                Supprimer avatar
              </button>
            </div>
          </div>

          <form className="settings-form-grid" onSubmit={handleSubmit}>
            <label className="settings-field">
              <span>Prénom</span>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Prénom"
              />
            </label>
            <label className="settings-field">
              <span>Nom</span>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom"
              />
            </label>

            <label className="settings-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
            </label>
            <label className="settings-field">
              <span>Numéro de téléphone</span>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="Téléphone"
              />
            </label>

            <label className="settings-field">
              <span>Sexe</span>
              <div className="settings-radio-group">
                <label>
                  <input
                    type="radio"
                    name="sexe"
                    value="homme"
                    checked={formData.sexe === 'homme'}
                    onChange={handleChange}
                  /> Homme
                </label>
                <label>
                  <input
                    type="radio"
                    name="sexe"
                    value="femme"
                    checked={formData.sexe === 'femme'}
                    onChange={handleChange}
                  /> Femme
                </label>
              </div>
            </label>
            <label className="settings-field">
              <span>Date de naissance</span>
              <input
                type="date"
                name="dateNaissance"
                value={formData.dateNaissance}
                onChange={handleChange}
              />
            </label>

            <label className="settings-field settings-field-full">
              <span>Adresse / Ville</span>
              <textarea
                name="adresse"
                rows="3"
                value={formData.adresse}
                onChange={handleChange}
                placeholder="Saisir votre adresse"
              ></textarea>
            </label>

            <div className="settings-submit-wrap settings-field-full">
              <button className="btn btn-solid settings-btn-compact" type="submit">
                Enregistrer les modifications
              </button>
              <a className="btn btn-outline settings-btn-compact" href="/espacepatient/profil">
                Voir le profil
              </a>
            </div>
          </form>
        </article>
       
      </div>
    </main>
  );
};

export default Parametres;