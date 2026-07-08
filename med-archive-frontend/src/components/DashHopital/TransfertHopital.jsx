import React, { useEffect, useMemo, useState } from "react";
import { deleteTransfertDossier, getCurrentUser, getServices, getTransfertDossiers, updateTransfertDossier } from "../../api";
import { NavLink } from "react-router-dom";

const statusTabs = ["Tous", "En cours", "Validé", "Refusé"];
const statusLabels = {
  demande: "En cours",
  accepte: "Validé",
  refuse: "Refusé",
};

function unwrapPaginated(response) {
  const payload = response?.data ?? response;
  const paginated = payload?.data && !Array.isArray(payload.data) ? payload.data : payload;
  return {
    rows: Array.isArray(paginated?.data) ? paginated.data : Array.isArray(paginated) ? paginated : [],
    total: paginated?.total ?? paginated?.data?.length ?? 0,
    lastPage: paginated?.last_page ?? 1,
  };
}

function unwrapItem(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(value));
}

function dateGroup(value) {
  if (!value) return "Sans date";
  const today = new Date();
  const date = new Date(value);
  const deltaDays = Math.floor((today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000);

  if (deltaDays === 0) return "Aujourd'hui";
  if (deltaDays > 0 && deltaDays <= 7) return "Cette semaine";
  return "Plus ancien";
}

function mapTransfer(item, currentEtablissementId) {
  const dossier = item.dossier;
  const patientUser = dossier?.patient?.user;
  const demandeurUser = item.demandeur;
  const sourceEtablissementId = item.etablissement_source_id || item.etablissementSource?.id || item.etablissement_source?.id;
  const destinationEtablissementId = item.etablissement_destination_id || item.etablissementDestination?.id || item.etablissement_destination?.id;
  const direction = String(sourceEtablissementId) === String(currentEtablissementId) ? "sent" : "received";

  return {
    id: item.id,
    raw: item,
    direction,
    canAccept: String(destinationEtablissementId) === String(currentEtablissementId) && item.statut === "demande",
    patient: patientUser?.name || dossier?.numero_dossier || "-",
    serviceActuel: item.service_source?.nom || item.serviceSource?.nom || "-",
    serviceDemande: item.service_destination?.nom || item.serviceDestination?.nom || "A choisir a la validation",
    hopitalDemande: item.etablissement_destination?.name || item.etablissementDestination?.name || "-",
    hopitalSource: item.etablissement_source?.name || item.etablissementSource?.name || "-",
    hopitalDestination: item.etablissement_destination?.name || item.etablissementDestination?.name || "-",
    statut: statusLabels[item.statut] || item.statut || "-",
    medecinReferent: demandeurUser?.name || "-",
    motif: item.motif || "-",
    observations: item.observations || "-",
    dateDemande: formatDate(item.date_demande),
    dateGroup: dateGroup(item.date_demande),
  };
}

const TransfertHopital = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [transferts, setTransferts] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentEtablissementId, setCurrentEtablissementId] = useState(null);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [mode, setMode] = useState("");
  const [editForm, setEditForm] = useState({ motif: "", observations: "" });
  const [acceptForm, setAcceptForm] = useState({ service_destination_id: "", observations: "" });
  const [services, setServices] = useState([]);
  const itemsPerPage = 8;

  useEffect(() => {
    document.title = "Transfert de Service";
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadTransferts() {
      try {
        setLoading(true);
        setError("");
        const meResponse = await getCurrentUser();
        const user = meResponse?.data?.user ?? meResponse?.user ?? meResponse;
        const etablissementId = user?.id;
        const [response, servicesResponse] = await Promise.all([
          getTransfertDossiers({
            page: currentPage,
            per_page: itemsPerPage,
            inter_etablissement: true,
          }),
          getServices({ etablissement_id: etablissementId, per_page: 100 }),
        ]);
        const { rows, total, lastPage } = unwrapPaginated(response);
        const { rows: serviceRows } = unwrapPaginated(servicesResponse);

        if (!ignore) {
          setCurrentEtablissementId(etablissementId);
          setTransferts(rows.map((row) => mapTransfer(row, etablissementId)));
          setServices(serviceRows);
          setTotalRows(total);
          setTotalPages(Math.max(1, lastPage));
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Impossible de charger les transferts.");
          setTransferts([]);
          setTotalRows(0);
          setTotalPages(1);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadTransferts();
    return () => {
      ignore = true;
    };
  }, [currentPage]);

  const filteredData = useMemo(() => {
    return transferts.filter((item) => {
      const matchesTab = activeTab === "Tous" || item.statut === activeTab;
      const matchesSearch = Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, search, transferts]);

  const groupedRows = useMemo(() => {
    return filteredData.reduce((acc, item) => {
      if (!acc[item.dateGroup]) acc[item.dateGroup] = [];
      acc[item.dateGroup].push(item);
      return acc;
    }, {});
  }, [filteredData]);

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette demande de transfert ?")) return;
    try {
      setActionError("");
      await deleteTransfertDossier(id);
      setTransferts((items) => items.filter((item) => item.id !== id));
      setTotalRows((total) => Math.max(0, total - 1));
      setSuccess("Demande supprimee.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de supprimer la demande.");
    }
  }

  function closeModal() {
    setMode("");
    setSelectedTransfer(null);
  }

  function openView(item) {
    setSelectedTransfer(item);
    setMode("view");
  }

  function openEdit(item) {
    setSelectedTransfer(item);
    setEditForm({ motif: item.raw?.motif || "", observations: item.raw?.observations || "" });
    setMode("edit");
  }

  function openAccept(item) {
    setSelectedTransfer(item);
    setAcceptForm({
      service_destination_id: item.raw?.service_destination_id || item.raw?.serviceDestination?.id || item.raw?.service_destination?.id || "",
      observations: item.raw?.observations || "",
    });
    setMode("accept");
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    try {
      setActionError("");
      const response = await updateTransfertDossier(selectedTransfer.id, editForm);
      const updated = unwrapItem(response);
      setTransferts((rows) => rows.map((row) => (row.id === selectedTransfer.id ? mapTransfer(updated, currentEtablissementId) : row)));
      closeModal();
      setSuccess("Demande mise a jour.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de modifier la demande.");
    }
  }

  async function handleAcceptSubmit(event) {
    event.preventDefault();
    try {
      setActionError("");
      if (!acceptForm.service_destination_id) {
        setActionError("Choisissez le service de prise en charge avant de valider le transfert.");
        return;
      }

      const response = await updateTransfertDossier(selectedTransfer.id, {
        statut: "accepte",
        service_destination_id: acceptForm.service_destination_id,
        observations: acceptForm.observations,
      });
      const updated = unwrapItem(response);
      setTransferts((rows) => rows.map((row) => (row.id === selectedTransfer.id ? mapTransfer(updated, currentEtablissementId) : row)));
      closeModal();
      setSuccess("Demande acceptee.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Impossible de valider le transfert.");
    }
  }

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Service Transfert</h1>
      </section>

      <section className="table-toolbar">
        <label className="table-search" aria-label="Recherche transferts">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Rechercher une demande de transfert..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <NavLink className="btn transfer-add-btn" to="nouvelle-demande">
          <i></i> Ajouter une demande
        </NavLink>
      </section>

      <section className="transfer-section">
        {actionError ? <p className="tp-alert-error">{actionError}</p> : null}
        {success ? <p className="tp-alert-success">{success}</p> : null}
        <article className="transfer-card">
          <div className="transfer-table-wrap">
            <div className="transfer-tabs">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`transfer-tab ${activeTab === tab ? "active" : ""}`}
                >
                  {tab === "Tous" ? <i className="fa-solid fa-list"></i> : null}
                  {tab === "En cours" ? <i className="fa-solid fa-clock"></i> : null}
                  {tab === "Validé" ? <i className="fa-solid fa-circle-check"></i> : null}
                  {tab === "Refusé" ? <i className="fa-solid fa-circle-xmark"></i> : null}
                  {tab}
                </button>
              ))}
            </div>

            {loading ? <p className="table-meta p-4">Chargement des transferts...</p> : null}
            {error ? <p className="table-meta p-4 text-danger">{error}</p> : null}
            {!loading && !error && filteredData.length === 0 ? (
              <p className="table-meta p-4">Aucune demande de transfert trouvée.</p>
            ) : null}

            {!loading && !error && filteredData.length > 0 ? (
              <table className="transfer-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Service actuel</th>
                    <th>Hopital demande</th>
                    <th>Statut</th>
                    <th>Demandeur</th>
                    <th>Motif</th>
                    <th>Date demande</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedRows).map(([groupLabel, rows]) => (
                    <React.Fragment key={groupLabel}>
                      <tr className="transfer-group-row">
                        <td colSpan={10}>
                          <i className="fa-solid fa-clock me-2"></i>
                          {groupLabel}
                        </td>
                      </tr>
                      {rows.map((item) => (
                        <tr key={item.id}>
                          <td className="table-nowrap ps-4">{item.id}</td>
                          <td className="table-title-cell">{item.patient}</td>
                          <td>
                            <span className={`rdv-status ${item.direction === "sent" ? "pending" : "upcoming"}`}>
                              {item.direction === "sent" ? "Envoyee" : "Recue"}
                            </span>
                          </td>
                          <td>{item.serviceActuel}</td>
                          <td>{item.hopitalDemande}</td>
                          <td>
                            <span
                              className={`rdv-status transfer-status-badge ${
                                item.statut === "En cours" ? "pending" : item.statut === "Validé" ? "upcoming" : "done"
                              }`}
                            >
                              {item.statut}
                            </span>
                          </td>
                          <td>{item.medecinReferent}</td>
                          <td>{item.motif}</td>
                          <td className="table-nowrap">{item.dateDemande}</td>
                          <td className="transfer-actions table-actions-compact">
                            <button className="action-icon" title="Voir" type="button" onClick={() => openView(item)}>
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            {item.direction === "sent" ? (
                              <>
                                <button className="action-icon" title="Modifier" type="button" onClick={() => openEdit(item)} disabled={item.raw?.statut !== "demande"}>
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button className="action-icon" title="Supprimer" type="button" onClick={() => handleDelete(item.id)} disabled={item.raw?.statut !== "demande"}>
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </>
                            ) : (
                              <button className="action-icon" title="Valider le transfert" type="button" onClick={() => openAccept(item)} disabled={!item.canAccept}>
                                <i className="fa-solid fa-check"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
          <div className="table-footer">
            <span className="table-meta">{totalRows} demandes de transfert</span>
            <div className="table-pagination">
              <button
                className="table-page"
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Précédent
              </button>
              <span className="table-page active">{currentPage}</span>
              <button
                className="table-page"
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Suivant
              </button>
            </div>
          </div>
        </article>
      </section>
      {mode && selectedTransfer ? (
        <div className="custom-modal-overlay" onClick={closeModal}>
          <form className="custom-modal custom-modal-wide" onSubmit={mode === "accept" ? handleAcceptSubmit : handleEditSubmit} onClick={(event) => event.stopPropagation()}>
            <div className="custom-modal-header">
              <h3>{mode === "edit" ? "Modifier la demande" : mode === "accept" ? "Valider le transfert" : "Details de la demande"}</h3>
              <button className="custom-modal-close" type="button" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="custom-modal-body custom-modal-grid">
              <p><strong>Patient</strong><br />{selectedTransfer.patient}</p>
              <p><strong>Type</strong><br />{selectedTransfer.direction === "sent" ? "Demande envoyee" : "Demande recue"}</p>
              <p><strong>Hopital source</strong><br />{selectedTransfer.hopitalSource}</p>
              <p><strong>Hopital destination</strong><br />{selectedTransfer.hopitalDestination}</p>
              <p><strong>Service source</strong><br />{selectedTransfer.serviceActuel}</p>
              <p><strong>Service d'accueil</strong><br />{selectedTransfer.serviceDemande}</p>
              <p><strong>Statut</strong><br />{selectedTransfer.statut}</p>
              <p><strong>Date</strong><br />{selectedTransfer.dateDemande}</p>
              <p><strong>Demandeur</strong><br />{selectedTransfer.medecinReferent}</p>
              {mode === "accept" ? (
                <>
                  <label className="form-group form-group-full">
                    <span>Service de prise en charge</span>
                    <select
                      name="service_destination_id"
                      value={acceptForm.service_destination_id}
                      onChange={(event) => setAcceptForm((form) => ({ ...form, service_destination_id: event.target.value }))}
                      required
                    >
                      <option value="">Choisir un service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>{service.nom}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-group form-group-full">
                    <span>Observations</span>
                    <textarea name="observations" rows="2" value={acceptForm.observations} onChange={(event) => setAcceptForm((form) => ({ ...form, observations: event.target.value }))} />
                  </label>
                </>
              ) : mode === "edit" ? (
                <>
                  <label className="form-group form-group-full">
                    <span>Motif</span>
                    <textarea name="motif" rows="2" value={editForm.motif} onChange={(event) => setEditForm((form) => ({ ...form, motif: event.target.value }))} />
                  </label>
                  <label className="form-group form-group-full">
                    <span>Observations</span>
                    <textarea name="observations" rows="2" value={editForm.observations} onChange={(event) => setEditForm((form) => ({ ...form, observations: event.target.value }))} />
                  </label>
                </>
              ) : (
                <>
                  <p className="form-group-full"><strong>Motif</strong><br />{selectedTransfer.motif}</p>
                  <p className="form-group-full"><strong>Observations</strong><br />{selectedTransfer.observations}</p>
                </>
              )}
            </div>
            <div className="custom-modal-footer">
              <button className="btn-cancel" type="button" onClick={closeModal}>Retour</button>
              {mode === "edit" ? <button className="btn-save" type="submit">Enregistrer</button> : null}
              {mode === "accept" ? <button className="btn-save" type="submit">Valider</button> : null}
            </div>
          </form>
        </div>
      ) : null}
      <style>{`
        .transfer-status-badge{white-space:nowrap;min-width:max-content;}
        .custom-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:18px;}
        .custom-modal{width:100%;max-width:760px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.18);}
        .custom-modal-header,.custom-modal-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;border-bottom:1px solid #e5e7eb;}
        .custom-modal-footer{border-top:1px solid #e5e7eb;border-bottom:0;justify-content:flex-end;}
        .custom-modal-close{border:0;background:transparent;font-size:20px;cursor:pointer;}
        .custom-modal-body{padding:22px;}
        .custom-modal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}
        .form-group-full{grid-column:1 / -1;}
        .form-group textarea,.form-group select{width:100%;border:1px solid #d9e1ea;border-radius:10px;padding:10px 12px;font:inherit;background:#fff;}
        .btn-cancel,.btn-save{border:0;border-radius:10px;padding:10px 18px;cursor:pointer;}
        .btn-save{background:#13c3b8;color:#fff;}
        .tp-alert-error{color:#b42318;background:#fff1f0;border-radius:10px;padding:10px 12px;margin:0 0 12px;}
        .tp-alert-success{color:#027a48;background:#ecfdf3;border-radius:10px;padding:10px 12px;margin:0 0 12px;}
        .action-icon:disabled{opacity:.45;cursor:not-allowed;}
        @media (max-width:720px){.custom-modal-grid{grid-template-columns:1fr;}}
      `}</style>
    </main>
  );
};

export default TransfertHopital;


