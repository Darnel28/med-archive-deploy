import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuthUser } from '../../api/client';
import { getCurrentUser } from '../../api/authApi';
import { getMesPatientsEtablissement, getPatients as getAllPatients } from '../../api';
import { getPatients as getDoctorPatients } from '../../api/medecinApi';
import { apiErrorMessage, unwrapList, valueAt } from '../DashAdmin/AdminCrudPage.jsx';
import AvatarInitials from '../AvatarInitials.jsx';

function normalizeAuthPayload(value) {
  return value?.data?.data?.user || value?.data?.user || value?.user || value?.data || value || null;
}

function extractMedecinId(auth) {
  return auth?.medecin?.id || auth?.user?.medecin?.id || auth?.medecin_id || auth?.user?.medecin_id || null;
}

function ageFromDate(value) {
  if (!value) return '-';
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function normalizePatient(row) {
  const patient = row.patient || row;
  const user = patient.user || row.user || {};
  const dossier = patient.dossier || row.dossier || {};
  return {
    id: patient.id || row.id,
    name: user.name || row.name || patient.name || '-',
    role: patient.groupe_sanguin ? `Groupe ${patient.groupe_sanguin}` : 'Patient suivi',
    org: dossier.numero_dossier ? `Dossier: ${dossier.numero_dossier}` : `IMU: ${patient.imu || '-'}`,
    tags: [patient.groupe_sanguin, patient.allergies ? 'Allergies' : null, dossier.statut].filter(Boolean),
    age: ageFromDate(user.date_naissance || patient.date_naissance),
    phone: user.telephone || row.telephone || '',
    lastConsult: row.derniere_consultation || patient.derniere_consultation || dossier.updated_at || patient.updated_at || '-',
  };
}

export default function DynamicPatientsDirectory({ title = 'Patients', source = 'all', detailPath = '/espaceaccueil/dossier-patient' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('grid');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadPatients() {
      setLoading(true);
      setError('');
      try {
        let response = null;
        if (source === 'doctor') {
          let auth = normalizeAuthPayload(getAuthUser());
          let medecinId = extractMedecinId(auth);
          if (!medecinId) {
            auth = normalizeAuthPayload(await getCurrentUser());
            medecinId = extractMedecinId(auth);
          }
          if (!medecinId) throw new Error('Impossible d identifier le medecin connecte.');
          response = await getDoctorPatients(medecinId);
        } else if (source === 'etablissement') {
          try {
            response = await getMesPatientsEtablissement({ per_page: 100 });
          } catch {
            response = await getAllPatients({ per_page: 100 });
          }
        } else {
          response = await getAllPatients({ per_page: 100 });
        }
        if (mounted) setPatients(unwrapList(response).rows.map(normalizePatient));
      } catch (err) {
        if (mounted) setError(apiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPatients();
    return () => {
      mounted = false;
    };
  }, [source]);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((patient) => [patient.name, patient.role, patient.org, ...(patient.tags || []), String(patient.age), patient.lastConsult].join(' ').toLowerCase().includes(query));
  }, [patients, searchQuery]);

  const renderAvatar = (patient) => <AvatarInitials name={patient.name} size={72} bgColor="#13c3b8" />;

  return (
    <main className="content page-tight mes-patients-main">
      <section className="page-title-card">
        <h1>{title}</h1>
      </section>

      <section className="mes-patients-toolbar">
        <label className="mes-patients-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <div className="mes-patients-toolbar-right">
          <div className="mes-patients-view-switch">
            <button className={`mes-patients-view-btn ${view === 'grid' ? 'active' : ''}`} type="button" onClick={() => setView('grid')}>
              <i className="fa-solid fa-table-cells-large"></i>
            </button>
            <button className={`mes-patients-view-btn ${view === 'list' ? 'active' : ''}`} type="button" onClick={() => setView('list')}>
              <i className="fa-solid fa-list"></i>
            </button>
          </div>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className={`mes-patients-view ${view === 'grid' ? 'active' : ''}`}>
        {loading && <p className="table-meta p-4">Chargement des patients...</p>}
        {!loading && filteredPatients.length === 0 && <p className="table-meta p-4">Aucun patient trouve.</p>}
        <div className="mes-patients-cards">
          {filteredPatients.map((patient) => (
            <article key={patient.id} className="mes-patients-card">
              <div className="mes-patients-card-main">
                <div className="mes-patients-avatar-wrap">{renderAvatar(patient)}</div>
                <h3 className="mes-patients-name">{patient.name}</h3>
                <p className="mes-patients-role">{patient.role}</p>
                <p className="mes-patients-org">{patient.org}</p>
                <div className="mes-patients-tags">
                  {patient.tags.map((tag) => <span key={tag} className="mes-patients-tag">{tag}</span>)}
                </div>
              </div>
              <div className="mes-patients-actions">
                <Link className="mes-patients-action-btn" to={detailPath}>
                  <i className="fa-solid fa-folder-open"></i>
                </Link>
                {patient.phone && <a className="mes-patients-action-btn" href={`tel:${patient.phone}`}><i className="fa-solid fa-phone"></i></a>}
              </div>
            </article>
          ))}
        </div>
        <div className="mes-patients-footer">
          <span>{filteredPatients.length} patient(s) affiche(s) sur {patients.length}</span>
        </div>
      </section>

      <section className={`mes-patients-view mes-patients-list-section ${view === 'list' ? 'active' : ''}`}>
        <article className="mes-patients-list-card">
          <div className="mes-patients-list-table-wrap">
            <table className="mes-patients-list-table">
              <thead>
                <tr><th>Nom</th><th>Age</th><th>Dossier / IMU</th><th>Derniere mise a jour</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.org}</td>
                    <td>{patient.lastConsult ? new Date(patient.lastConsult).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>
                      <div className="mes-patients-list-actions">
                        <Link className="icon-action" to={detailPath}><i className="fa-solid fa-folder-open"></i></Link>
                        {patient.phone && <a className="icon-action" href={`tel:${patient.phone}`}><i className="fa-solid fa-phone"></i></a>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredPatients.length === 0 && <tr><td colSpan="5">Aucun patient trouve.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="mes-patients-list-footer">
            <span className="table-meta">{filteredPatients.length} patients suivis</span>
          </div>
        </article>
      </section>
    </main>
  );
}
