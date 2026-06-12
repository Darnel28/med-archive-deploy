import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import telecharger1 from "../../assets/img/télécharger (1).jpeg";
import { ageFromDate, formatDateTime, latestByDate, loadPatientDashboardData, patientFromUser } from './patientDashboardData';

const DashboardHome = () => {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let mounted = true;
    loadPatientDashboardData()
      .then((data) => mounted && setState({ loading: false, error: '', data }))
      .catch((error) => mounted && setState({ loading: false, error: error?.response?.data?.message || 'Impossible de charger le dashboard.', data: null }));
    return () => {
      mounted = false;
    };
  }, []);

  const data = state.data;
  const user = data?.user;
  const patient = patientFromUser(user);
  const upcoming = useMemo(() => (data?.consultations || [])
    .filter((consultation) => new Date(consultation.date_consultation) >= new Date())
    .sort((a, b) => new Date(a.date_consultation) - new Date(b.date_consultation)), [data]);
  const latestConsultation = latestByDate(data?.consultations || [], 'date_consultation');
  const latestOrdonnance = latestByDate(data?.ordonnances || [], 'created_at');

  if (state.loading) {
    return <section className="page-title-card"><h1>Chargement du dashboard patient...</h1></section>;
  }

  if (state.error) {
    return <section className="page-title-card"><h1>{state.error}</h1></section>;
  }

  return (
    <>
      <section className="patient-overview-card">
        <img src={telecharger1} alt="Illustration patient" />
        <div className="patient-overview-content">
          <h2>Bonjour {user?.name || 'Patient'}</h2>
          <div className="patient-index-grid">
            <div><span>Sexe</span><strong>{user?.sexe || '-'}</strong></div>
            <div><span>Age</span><strong>{ageFromDate(user?.date_naissance)}</strong></div>
            <div><span>Taille</span><strong>{user?.taille || '-'}</strong></div>
            <div><span>Ville</span><strong>{user?.ville || '-'}</strong></div>
            <div><span>Groupe sanguin</span><strong>{patient?.groupe_sanguin || '-'}</strong></div>
            <div><span>IMU</span><strong>{patient?.imu || '-'}</strong></div>
          </div>
        </div>
      </section>

      {/* <section className="bottom-cards">
        <article className="small-card"><span>CONSULTATIONS</span><strong>{data.consultations.length}</strong></article>
        <article className="small-card"><span>ORDONNANCES</span><strong>{data.ordonnances.length}</strong></article>
        <article className="small-card"><span>ANALYSES</span><strong>{data.analyses.length}</strong></article>
        <article className="small-card"><span>FACTURES A PAYER</span><strong>{data.factures.filter((facture) => facture.statut !== 'payee').length}</strong></article>
      </section> */}

      <section className="patient-bottom-grid">
        <article className="patient-card upcoming-encounters-card">
          <h3>Consultations a venir</h3>
          <div className="encounters-surface">
            {upcoming[0] ? (
              <>
                <div className="encounters-date-block">
                  <strong>{formatDateTime(upcoming[0].date_consultation)}</strong>
                  <span>{upcoming[0].statut_paiement === 'payee' ? 'Paye' : 'A payer'}</span>
                </div>
                <div className="encounter-highlight">
                  <h4>{upcoming[0].motif || 'Consultation medicale'}</h4>
                  <div className="encounter-meta">
                    <p><i className="fa-regular fa-calendar"></i> {formatDateTime(upcoming[0].date_consultation)}</p>
                    <p>{upcoming[0].medecin?.user?.name || 'Medecin'} - {upcoming[0].service?.nom || upcoming[0].medecin?.specialite?.nom || 'Service medical'}</p>
                  </div>
                </div>
                <ul className="encounters-notes">
                  {upcoming.slice(0, 3).map((consultation) => (
                    <li key={consultation.id}>
                      <i className="fa-regular fa-circle-check"></i>
                      {formatDateTime(consultation.date_consultation)} - {consultation.motif}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Aucun rendez-vous a venir.</p>
            )}
            <Link to="/espacepatient/rendez-vous" className="patient-compact-btn">Voir mes rendez-vous</Link>
          </div>
        </article>

        <aside className="patient-card diagnosis-panel">
          <h3>Derniere conclusion medicale</h3>
          <div className="diagnosis-surface">
            <div className="diagnosis-head">
              <h4>{latestConsultation?.diagnostic || 'Aucun diagnostic renseigne'}</h4>
              <span>{formatDateTime(latestConsultation?.date_consultation)}</span>
            </div>
            <p>{latestConsultation?.observations || latestConsultation?.motif || 'Votre historique medical sera affiche ici apres consultation.'}</p>
            <div className="doctor-row">
              <span>Medecin referent</span>
              <div><strong>{latestConsultation?.medecin?.user?.name || '-'}</strong></div>
            </div>
            <div className="receipt-row">
              <span>Ordonnance recente</span>
              <div>
                <strong>{latestOrdonnance ? `ORD-${latestOrdonnance.id}` : 'Aucune ordonnance'}</strong>
                <p>{latestOrdonnance?.instructions || latestOrdonnance?.posologie || 'Les prescriptions apparaitront dans le menu Ordonnances.'}</p>
              </div>
            </div>
            <Link to="/espacepatient/dossier-medical" className="patient-compact-btn">Ouvrir le dossier medical</Link>
          </div>
        </aside>
      </section>
    </>
  );
};

export default DashboardHome;
