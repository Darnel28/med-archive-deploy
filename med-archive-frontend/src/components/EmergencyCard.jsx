import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmergencyCardByImu } from '../api/patientApi';

const valueOrFallback = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || 'Non renseigne';
  return value || 'Non renseigne';
};

const EmergencyCard = () => {
  const { imu } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getEmergencyCardByImu(imu)
      .then((response) => active && setCard(response?.data || null))
      .catch((requestError) => active && setError(requestError?.response?.data?.message || 'Impossible de charger cette fiche d’urgence.'));
    return () => { active = false; };
  }, [imu]);

  if (error) return <main className="emergency-page"><section className="emergency-card emergency-error"><h1>Fiche indisponible</h1><p>{error}</p></section></main>;
  if (!card) return <main className="emergency-page"><section className="emergency-card"><p>Chargement de la fiche d’urgence...</p></section></main>;

  const [nom = '', ...prenoms] = (card.nom_complet || '').trim().split(/\s+/);
  const fields = [
    ['Groupe sanguin', card.groupe_sanguin], ['Allergies', card.allergies],
    ['Antecedents medicaux importants', card.antecedents_medicaux], ['Maladies chroniques', card.maladies_chroniques],
    ['Medicaments actuellement pris', card.medicaments_actuels], ['Implants ou dispositifs medicaux', card.implants_dispositifs],
  ];

  return (
    <main className="emergency-page">
      <section className="emergency-card">
        <div className="emergency-heading"><span aria-hidden="true">🩺</span><div><p>Fiche medicale d’urgence</p><h1>Informations du patient</h1></div></div>
        <section className="emergency-section identity-section">
          {card.photo ? <img className="emergency-photo" src={card.photo} alt="Patient" /> : null}
          <div><h2>Informations d'identite</h2><dl><div><dt>Nom</dt><dd>{valueOrFallback(nom)}</dd></div><div><dt>Prenom</dt><dd>{valueOrFallback(prenoms.join(' '))}</dd></div><div><dt>Sexe</dt><dd>{valueOrFallback(card.sexe)}</dd></div><div><dt>Date de naissance</dt><dd>{valueOrFallback(card.date_naissance)}</dd></div></dl></div>
        </section>
        <section className="emergency-section"><h2>🩸 Informations medicales critiques</h2><dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{valueOrFallback(value)}</dd></div>)}</dl></section>
        <section className="emergency-section"><h2>📞 Contact d'urgence</h2><dl><div><dt>Nom de la personne a prevenir</dt><dd>{valueOrFallback(card.personne_contact)}</dd></div><div><dt>Lien de parente</dt><dd>{valueOrFallback(card.lien_parente)}</dd></div><div><dt>Numero de telephone</dt><dd>{valueOrFallback(card.telephone_contact)}</dd></div></dl></section>
        <section className="emergency-section emergency-reference"><dl><div><dt>IMU (Identifiant Medical Unique)</dt><dd>{valueOrFallback(card.imu)}</dd></div><div><dt>Dernier etablissement frequente</dt><dd>{valueOrFallback(card.dernier_etablissement)}</dd></div></dl></section>
      </section>
    </main>
  );
};

export default EmergencyCard;
