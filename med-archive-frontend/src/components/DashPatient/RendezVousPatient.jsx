import React, { useEffect, useMemo, useState } from 'react';
import { getMesConsultations } from '../../api/patientApi';
import { creerPaiementFedapay } from '../../api/factureApi';
import { updateConsultation } from '../../api/consultationApi';
import { apiClient } from '../../api/client';

const unwrapRows = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('fr-FR') : '-';
const formatHour = (value) => value ? new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-';
const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;

const RendezVousPatient = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [freeSlots, setFreeSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const itemsPerPage = 5;

  const loadAppointments = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await getMesConsultations({ periode: 'avenir', per_page: 50 });
      setAppointments(unwrapRows(response));
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible de charger vos rendez-vous.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredRdv = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return appointments;
    return appointments.filter((rdv) => {
      const text = [
        rdv?.motif,
        rdv?.medecin?.user?.name,
        rdv?.medecin?.specialite?.nom,
        rdv?.service?.nom,
        rdv?.statut,
        rdv?.statut_paiement,
      ].join(' ').toLowerCase();
      return text.includes(query);
    });
  }, [appointments, searchTerm]);

  const indexOfLast = currentPage * itemsPerPage;
  const currentRdv = filteredRdv.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredRdv.length / itemsPerPage);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

const handlePay = async (rdv) => {
  try {
    const facture = rdv?.facture;

    if (!facture) {
      setMessage("Aucune facture associée à ce rendez-vous.");
      return;
    }

    const response = await creerPaiementFedapay(facture.id);

    console.log("REPONSE FEDAPAY =", response);

    if (response?.url) {
      window.location.href = response.url;
      return;
    }

    console.error("URL de paiement introuvable", response);

  } catch (error) {
    console.error(error);
    setMessage("Impossible d'initialiser le paiement.");
  }
};
  const openReschedule = async (rdv) => {
    setEditing(rdv);
    setSelectedSlot('');
    setFreeSlots([]);
    setMessage('');
    try {
      const date = new Date(rdv.date_consultation).toISOString().slice(0, 10);
      const response = await apiClient.get(`/medecins/${rdv.medecin_id}/planning`, { params: { date } });
      setFreeSlots(response.data?.data?.creneaux_libres || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible de recuperer les heures libres du medecin.');
    }
  };

  const submitReschedule = async () => {
    if (!editing || !selectedSlot) return;
    setMessage('Modification du rendez-vous...');
    try {
      await updateConsultation(editing.id, { date_consultation: selectedSlot });
      setMessage('Rendez-vous modifie avec succes.');
      setEditing(null);
      await loadAppointments();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Modification impossible.');
    }
  };

  const getStatutClass = (rdv) => {
    if (rdv.statut === 'termine') return 'rdv-status done';
    if (rdv.statut_paiement !== 'payee') return 'rdv-status pending';
    return 'rdv-status upcoming';
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Rendez-vous medicaux</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche rendez-vous">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Chercher un rendez-vous..." value={searchTerm} onChange={handleSearch} />
        </label>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Medecin</th>
                  <th>Service</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                {!loading && currentRdv.map((rdv) => (
                  <tr key={rdv.id}>
                    <td>{formatDate(rdv.date_consultation)}</td>
                    <td>{formatHour(rdv.date_consultation)}</td>
                    <td>{rdv.medecin?.user?.name || 'Medecin'}</td>
                    <td>{rdv.service?.nom || rdv.medecin?.specialite?.nom || '-'}</td>
                    <td>{formatMoney(rdv.facture?.montant_restant ?? rdv.montant_consultation)}</td>
                    <td>
                      <span className={getStatutClass(rdv)}>
                        {rdv.statut_paiement === 'payee' ? 'Paye' : 'A payer'}
                      </span>
                    </td>
                    <td className="rdv-actions">
                      <button className="icon-action" title="Payer" onClick={() => handlePay(rdv)} disabled={rdv.statut_paiement === 'payee'}>
                        <i className="fa-solid fa-credit-card"></i>
                      </button>
                      <button className="icon-action" title="Modifier" onClick={() => openReschedule(rdv)}>
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && currentRdv.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>Aucun rendez-vous a venir</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">{filteredRdv.length} rendez-vous planifies</span>
            <div className="table-pagination">
              <button className="table-page" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                Precedent
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button key={index} className={`table-page ${currentPage === index + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(index + 1)}>
                  {index + 1}
                </button>
              ))}
              <button className="table-page" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                Suivant
              </button>
            </div>
          </div>
        </article>
      </section>

      {editing && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2>Choisir une heure libre</h2>
            <select value={selectedSlot} onChange={(event) => setSelectedSlot(event.target.value)}>
              <option value="">Selectionner un creneau</option>
              {freeSlots.map((slot) => (
                <option key={slot.date_consultation} value={slot.date_consultation}>{slot.heure}</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Annuler</button>
              <button className="btn btn-solid" onClick={submitReschedule} disabled={!selectedSlot}>Valider</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default RendezVousPatient;
