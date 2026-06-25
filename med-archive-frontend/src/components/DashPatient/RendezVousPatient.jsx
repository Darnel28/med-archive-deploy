import React, { useEffect, useMemo, useState } from 'react';
import { getMesConsultations } from '../../api/patientApi';
import { payerFacture } from '../../api/factureApi';
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
  const [paymentRdv, setPaymentRdv] = useState(null);
  const [paying, setPaying] = useState(false);
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

  const handlePay = (rdv) => {
    const facture = rdv?.facture;

    if (!facture) {
      setMessage("Aucune facture associee a ce rendez-vous.");
      return;
    }

    setPaymentRdv(rdv);
  };

  const confirmTestPayment = async () => {
    const facture = paymentRdv?.facture;
    if (!facture) return;

    setPaying(true);
    setMessage('');
    try {
      /*
      Paiement reel desactive pour l'environnement de test.
      const response = await creerPaiementFedapay(facture.id);
      if (response?.url) window.location.href = response.url;
      */
      await payerFacture(facture.id, {
        montant: facture.montant_restant,
        methode: 'mobile_money',
        reference: `TEST-RDV-${Date.now()}`,
      });
      setMessage('Paiement du rendez-vous valide avec succes.');
      setPaymentRdv(null);
      await loadAppointments();
    } catch (error) {
      console.error(error);
      setMessage("Impossible de valider le paiement test.");
    } finally {
      setPaying(false);
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

    {paymentRdv && (
    <div className="modal-backdrop">
        <div className="modal-card">

            <div className="modal-icon">
                <i className="fa-solid fa-credit-card"></i>
            </div>

            <h2>Paiement du rendez-vous</h2>

            <p>
                Vous êtes sur le point de régler la somme de
                <br /><br />
                <strong style={{fontSize:'22px', color:'#0ea5e9'}}>
                    {formatMoney(paymentRdv.facture?.montant_restant ?? paymentRdv.montant_consultation)}
                </strong>
            </p>

            <div className="modal-actions">
                <button
                    className="btn-outline"
                    onClick={() => setPaymentRdv(null)}
                    disabled={paying}
                >
                    Annuler
                </button>

                <button
                    className="btn-solid"
                    onClick={confirmTestPayment}
                    disabled={paying}
                >
                    {paying ? (
                        <>
                            <i className="fa fa-spinner fa-spin"></i>
                            &nbsp; Validation...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-check"></i>
                            &nbsp; Confirmer
                        </>
                    )}
                </button>
            </div>

        </div>
    </div>
)}
      <style>
        {
          `
          /* Fond sombre */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn .25s ease;
}

/* Boîte du modal */
.modal-card {
    width: 95%;
    max-width: 460px;
    background: #fff;
    border-radius: 18px;
    padding: 30px;
    box-shadow: 0 18px 45px rgba(0,0,0,.18);
    animation: zoomIn .25s ease;
}

/* Icône */
.modal-icon{
    width:70px;
    height:70px;
    margin:auto;
    border-radius:50%;
    background:#e8f7ff;
    color:#0099cc;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:30px;
    margin-bottom:18px;
}

/* Titre */
.modal-card h2{
    margin:0;
    text-align:center;
    font-size:24px;
    font-weight:700;
    color:#14324a;
}

/* Texte */
.modal-card p{
    margin:18px 0 25px;
    text-align:center;
    line-height:1.7;
    color:#666;
    font-size:15px;
}

/* Boutons */
.modal-actions{
    display:flex;
    gap:15px;
}

.modal-actions button{
    flex:1;
    border:none;
    border-radius:12px;
    padding:13px;
    font-size:15px;
    font-weight:600;
    cursor:pointer;
    transition:.25s;
}

.btn-outline{
    background:#f4f5f7;
    color:#555;
}

.btn-outline:hover{
    background:#e5e7eb;
}

.btn-solid{
    background:#0ea5e9;
    color:#fff;
}

.btn-solid:hover{
    background:#0284c7;
}

.btn-solid:disabled,
.btn-outline:disabled{
    opacity:.6;
    cursor:not-allowed;
}

@keyframes fadeIn{
    from{opacity:0;}
    to{opacity:1;}
}

@keyframes zoomIn{
    from{
        opacity:0;
        transform:scale(.8);
    }
    to{
        opacity:1;
        transform:scale(1);
    }
}
          `

        }
      </style>
    </main>
  );
};

export default RendezVousPatient;
