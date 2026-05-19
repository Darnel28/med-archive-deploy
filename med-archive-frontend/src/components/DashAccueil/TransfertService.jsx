
import React, { useMemo, useState } from 'react';

const statusTabs = ['Tous', 'En cours', 'Validé', 'Refusé'];

const staticData = [
    {
        id: 1,
        patient: "Awa Traoré",
        serviceActuel: "Médecine générale",
        serviceDemande: "Cardiologie",
        statut: "En cours",
        medecinReferent: "Dr. Jean DOUGLAS",
        motif: "Douleurs thoraciques",
        dateDemande: "05/05/2026",
        dateGroup: "Aujourd'hui",
    },
    {
        id: 2,
        patient: "Moussa Diallo",
        serviceActuel: "Médecine générale",
        serviceDemande: "ORL",
        statut: "Validé",
        medecinReferent: "Dr. Alice ZOKA",
        motif: "Infections ORL récurrentes",
        dateDemande: "04/05/2026",
        dateGroup: "Aujourd'hui",
    },
    {
        id: 3,
        patient: "Nadia Koné",
        serviceActuel: "Médecine générale",
        serviceDemande: "Médecine interne",
        statut: "Refusé",
        medecinReferent: "Dr. Amadou SAMBA",
        motif: "Demande non prioritaire",
        dateDemande: "03/05/2026",
        dateGroup: "Cette semaine",
    },
    {
        id: 4,
        patient: "Koffi MENSAH",
        serviceActuel: "Neurologie",
        serviceDemande: "Chirurgie",
        statut: "En cours",
        medecinReferent: "Dr. Claire Durand",
        motif: "Avis chirurgical demandé",
        dateDemande: "01/05/2026",
        dateGroup: "Cette semaine",
    },
    // {
    //   id: 5,
    //   titre: "Client grand compte",
    //   statut: "Clôturé",
    //   valeur: "200000",
    //   commercial: "Patrick N.",
    //   contact: "AFR Logistic",
    //   offre: "Licence",
    //   action: "Clos",
    //   relance: "25/04/2026",
    //   dateGroup: "Cette semaine",
    // },
];

const TransfertService = () => {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("Tous");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredData = useMemo(() => {
        return staticData.filter((item) => {
            const matchesTab = activeTab === "Tous" || item.statut === activeTab;
            const matchesSearch = Object.values(item)
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [activeTab, search]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

    const groupedRows = useMemo(() => {
        return paginatedData.reduce((acc, item) => {
            if (!acc[item.dateGroup]) acc[item.dateGroup] = [];
            acc[item.dateGroup].push(item);
            return acc;
        }, {});
    }, [paginatedData]);

    document.title = "Transfert de Service ";

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
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </label>
                <button className="btn transfer-add-btn" type="button">
                    <i className="fa-solid fa-plus"></i> Ajouter une demande
                </button>
            </section>

            <section className="transfer-section">
                <article className="transfer-card">
                    <div className="transfer-table-wrap">
                        <div className="transfer-tabs">
                            {statusTabs.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => {
                                        setActiveTab(tab);
                                        setCurrentPage(1);
                                    }}
                                    className={`transfer-tab ${activeTab === tab ? 'active' : ''}`}
                                >
                                    {tab === 'Tous' ? <i className="fa-solid fa-list"></i> : null}
                                    {tab === 'En cours' ? <i className="fa-solid fa-clock"></i> : null}
                                    {tab === 'Validé' ? <i className="fa-solid fa-circle-check"></i> : null}
                                    {tab === 'Refusé' ? <i className="fa-solid fa-circle-xmark"></i> : null}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <table className="transfer-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Patient</th>
                                    <th>Service actuel</th>
                                    <th>Service demandé</th>
                                    <th>Statut</th>
                                    <th>Médecin référent</th>
                                    <th>Motif</th>
                                    <th>Date demande</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedRows).map(([groupLabel, rows]) => (
                                    <React.Fragment key={groupLabel}>
                                        <tr className="transfer-group-row">
                                            <td colSpan={9}>
                                                <i className="fa-solid fa-clock me-2"></i>{groupLabel}
                                            </td>
                                        </tr>
                                        {rows.map((item) => (
                                            <tr key={item.id}>
                                                <td className="table-nowrap ps-4">{item.id}</td>
                                                <td className="table-title-cell">{item.patient}</td>
                                                <td>{item.serviceActuel}</td>
                                                <td>{item.serviceDemande}</td>
                                                <td>
                                                    <span className={`rdv-status ${item.statut === 'En cours' ? 'pending' :
                                                        item.statut === 'Validé' ? 'upcoming' :
                                                            item.statut === 'Refusé' ? 'done' : ''
                                                        }`}>
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
                                                    <button className="action-icon" title="Supprimer" type="button">
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="table-footer">
                        <span className="table-meta">{filteredData.length} demandes de transfert</span>
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

export default TransfertService;