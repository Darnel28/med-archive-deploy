import React, { useEffect, useMemo, useState } from 'react';
import { ageFromDate, formatDate, formatDateTime, latestByDate, loadPatientDashboardData, patientFromUser } from './patientDashboardData';

const avatarFor = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Patient')}&background=0f766e&color=fff`;

const Profil = () => {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let active = true;
    loadPatientDashboardData()
      .then((data) => active && setState({ loading: false, error: '', data }))
      .catch((error) => active && setState({ loading: false, error: error?.response?.data?.message || 'Impossible de charger votre profil.', data: null }));
    return () => { active = false; };
  }, []);

  const data = state.data;
  const user = data?.user || {};
  const patient = patientFromUser(user) || {};
  const consultations = data?.consultations || [];
  const analyses = data?.analyses || [];

  const upcoming = useMemo(() => consultations
    .filter((consultation) => new Date(consultation.date_consultation) >= new Date())
    .sort((a, b) => new Date(a.date_consultation) - new Date(b.date_consultation)), [consultations]);

  const past = useMemo(() => consultations
    .filter((consultation) => new Date(consultation.date_consultation) < new Date())
    .sort((a, b) => new Date(b.date_consultation) - new Date(a.date_consultation)), [consultations]);

  const files = analyses.filter((analysis) => analysis.fichier_resultat).slice(0, 4);
  const notes = consultations.filter((consultation) => consultation.observations || consultation.diagnostic).slice(0, 3);
  const latestConsultation = latestByDate(consultations, 'date_consultation');

  if (state.loading) {
    return <main className="content page-tight"><section className="page-title-card"><h1>Chargement du profil...</h1></section></main>;
  }

  if (state.error) {
    return <main className="content page-tight"><section className="page-title-card"><h1>{state.error}</h1></section></main>;
  }

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Profil patient</h1>
      </section>

      <div className="profile-layout">
        <div className="profile-card profile-identity-card">
          <img src={avatarFor(user.name)} alt="Photo de profil" className="profile-avatar-large" />
          <h2>{user.name || 'Patient'}</h2>
          <h3>{patient.imu || patient.npi || 'Dossier patient'}</h3>
          <a href={`tel:${user.telephone || ''}`} className="profile-contact-link">{user.telephone || '-'}</a>
          <a href={`mailto:${user.email || ''}`} className="profile-contact-sub">{user.email || '-'}</a>
        </div>

        <div className="profile-card">
          <div className="profile-card-head">
            <h2>Informations de base du patient</h2>
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="profile-kv-grid">
            <div className="profile-kv-row"><span>Nom complet:</span><span className="profile-kv-value">{user.name || '-'}</span></div>
            <div className="profile-kv-row"><span>Date de naissance:</span><span className="profile-kv-value">{formatDate(user.date_naissance)} ({ageFromDate(user.date_naissance)})</span></div>
            <div className="profile-kv-row"><span>Sexe:</span><span className="profile-kv-value">{user.sexe || '-'}</span></div>
            <div className="profile-kv-row"><span>Telephone:</span><span className="profile-kv-value">{user.telephone || '-'}</span></div>
            <div className="profile-kv-row"><span>Email:</span><span className="profile-kv-value">{user.email || '-'}</span></div>
            <div className="profile-kv-row"><span>Adresse / Ville:</span><span className="profile-kv-value">{[user.adresse, user.ville].filter(Boolean).join(', ') || '-'}</span></div>
            <div className="profile-kv-row"><span>IMU:</span><span className="profile-kv-value">{patient.imu || '-'}</span></div>
            <div className="profile-kv-row"><span>NPI:</span><span className="profile-kv-value">{patient.npi || '-'}</span></div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-head">
            <h2>Informations importantes</h2>
            <i className="fa-solid fa-stethoscope"></i>
          </div>
          <div className="profile-kv-grid">
            <div className="profile-kv-row"><span>Groupe sanguin:</span><span className="profile-kv-value">{patient.groupe_sanguin || '-'}</span></div>
            <div className="profile-kv-row"><span>Allergies:</span><span className="profile-kv-value">{patient.allergies || 'Aucune renseignee'}</span></div>
            <div className="profile-kv-row"><span>Antecedents medicaux:</span><span className="profile-kv-value">{patient.antecedents_medicaux || '-'}</span></div>
            <div className="profile-kv-row"><span>Derniere consultation:</span><span className="profile-kv-value">{formatDateTime(latestConsultation?.date_consultation)}</span></div>
          </div>
        </div>

        <div className="profile-card profile-visits-card">
          <div className="profile-visits-tabs">
            <button className="active" type="button">Visites futures ({upcoming.length})</button>
            <button type="button">Visites passees ({past.length})</button>
            <button type="button">Analyses ({analyses.length})</button>
          </div>

          {(upcoming.length ? upcoming : past).slice(0, 3).map((consultation, index) => (
            <div className={`profile-visit-row ${index % 2 === 0 ? 'purple' : 'cyan'}`} key={consultation.id}>
              <div className="profile-visit-time">
                <span>{formatDateTime(consultation.date_consultation)}</span>
                <span className="profile-visit-value">{consultation.statut_paiement === 'payee' ? 'Paye' : 'A payer'}</span>
              </div>
              <div className="profile-visit-col">
                <span>Service:</span>
                <span className="profile-visit-value">{consultation.service?.nom || consultation.medecin?.specialite?.nom || consultation.motif || '-'}</span>
              </div>
              <div className="profile-visit-col">
                <span>Medecin:</span>
                <span className="profile-visit-value">{consultation.medecin?.user?.name || '-'}</span>
              </div>
              <div className="profile-visit-status">
                <span>Statut:</span>
                <em>{consultation.statut || 'programme'}</em>
              </div>
            </div>
          ))}

          {consultations.length === 0 && <p>Aucune visite enregistree.</p>}
        </div>

        <div className="profile-side-stack">
          <div className="profile-card profile-file-card">
            <div className="profile-card-head profile-mini-head">
              <h2>Fichiers</h2>
            </div>
            <ul className="profile-mini-list">
              {files.map((analysis) => (
                <li key={analysis.id}><i className="fa-regular fa-file-lines"></i><span>{analysis.type_analyse}</span><span className="profile-file-size">Resultat</span></li>
              ))}
              {files.length === 0 && <li><i className="fa-regular fa-file-lines"></i><span>Aucun fichier joint</span></li>}
            </ul>
          </div>

          <div className="profile-card profile-file-card">
            <div className="profile-card-head profile-mini-head">
              <h2>Notes</h2>
            </div>
            <ul className="profile-mini-list">
              {notes.map((consultation) => (
                <li key={consultation.id}><i className="fa-regular fa-note-sticky"></i><span>{consultation.diagnostic || consultation.observations}</span><span className="profile-file-size">{formatDate(consultation.date_consultation)}</span></li>
              ))}
              {notes.length === 0 && <li><i className="fa-regular fa-note-sticky"></i><span>Aucune note medicale</span></li>}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profil;
