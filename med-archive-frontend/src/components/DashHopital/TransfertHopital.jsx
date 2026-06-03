import React, { useEffect, useMemo, useState } from "react";
import { deleteTransfertDossier, getTransfertDossiers } from "../../api";
import { NavLink } from "react-router-dom";

const statusTabs = ["Tous", "En cours", "Validé", "Refusé"];
const statusLabels = {
  demande: "En cours",
  accepte: "Validé",
  refuse: "Refusé",
};

function unwrapPaginated(response) {
  const payload = response?.data ?? response;
  return {
    rows: Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [],
    total: payload?.total ?? payload?.data?.length ?? 0,
    lastPage: payload?.last_page ?? 1,
  };
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

function mapTransfer(item) {
  const dossier = item.dossier;
  const patientUser = dossier?.patient?.user;
  const demandeurUser = item.demandeur;

  return {
    id: item.id,
    patient: patientUser?.name || dossier?.numero_dossier || "-",
    serviceActuel: item.service_source?.nom || item.serviceSource?.nom || "-",
    serviceDemande: item.service_destination?.nom || item.serviceDestination?.nom || "-",
    statut: statusLabels[item.statut] || item.statut || "-",
    medecinReferent: demandeurUser?.name || "-",
    motif: item.motif || "-",
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
        const response = await getTransfertDossiers({
          page: currentPage,
          per_page: itemsPerPage,
        });
        const { rows, total, lastPage } = unwrapPaginated(response);

        if (!ignore) {
          setTransferts(rows.map(mapTransfer));
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
    await deleteTransfertDossier(id);
    setTransferts((items) => items.filter((item) => item.id !== id));
    setTotalRows((total) => Math.max(0, total - 1));
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
                    <th>Service actuel</th>
                    <th>Service demandé</th>
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
                      <tr>
                        <td colSpan={9} className="py-2 text-primary fw-semibold bg-light-subtle">
                          <i className="fa-solid fa-clock me-2"></i>
                          {groupLabel}
                        </td>
                      </tr>
                      {rows.map((item) => (
                        <tr key={item.id}>
                          <td className="table-nowrap ps-4">{item.id}</td>
                          <td className="table-title-cell">{item.patient}</td>
                          <td>{item.serviceActuel}</td>
                          <td>{item.serviceDemande}</td>
                          <td>
                            <span
                              className={`rdv-status ${
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
                            <button className="action-icon" title="Voir" type="button">
                              <i className="fa-solid fa-eye"></i>
                            </button>
                            <button className="action-icon" title="Modifier" type="button">
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button className="action-icon" title="Supprimer" type="button" onClick={() => handleDelete(item.id)}>
                              <i className="fa-solid fa-trash"></i>
                            </button>
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
    </main>
  );
};

export default TransfertHopital;
