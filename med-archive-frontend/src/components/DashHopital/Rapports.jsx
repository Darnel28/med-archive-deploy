import React, { useEffect } from 'react';
import '../../assets/css/Hopital.css';

const transferAudits = [
    {
        id: 'TR-2401',
        patient: 'Awa Traoré',
        fromService: 'Médecine générale',
        toService: 'Cardiologie',
        transferredBy: 'Infirmier Yao K.',
        referringDoctor: 'Dr. Jean DOUGLAS',
        reason: 'Douleurs thoraciques',
        date: '10/05/2026 09:20',
        status: 'Validé',
    },
    {
        id: 'TR-2402',
        patient: 'Moussa Diallo',
        fromService: 'Urgences',
        toService: 'ORL',
        transferredBy: 'Agent de régulation A. Koné',
        referringDoctor: 'Dr. Alice ZOKA',
        reason: 'Infections ORL récurrentes',
        date: '10/05/2026 11:15',
        status: 'En cours',
    },
    {
        id: 'TR-2403',
        patient: 'Nadia Koné',
        fromService: 'Pédiatrie',
        toService: 'Médecine interne',
        transferredBy: 'Secrétariat hospitalier',
        referringDoctor: 'Dr. Amadou SAMBA',
        reason: 'Avis spécialisé',
        date: '09/05/2026 16:40',
        status: 'Refusé',
    },
    {
        id: 'TR-2404',
        patient: 'Koffi MENSAH',
        fromService: 'Neurologie',
        toService: 'Chirurgie',
        transferredBy: 'Dr. Claire Durand',
        referringDoctor: 'Dr. Claire Durand',
        reason: 'Avis chirurgical demandé',
        date: '08/05/2026 08:50',
        status: 'Validé',
    },
];

const patientMovements = [
    {
        patient: 'Awa Traoré',
        movement: 'Passage service',
        detail: 'Consultation générale vers cardiologie',
        author: 'Infirmier Yao K.',
        timestamp: '10/05/2026 09:25',
    },
    {
        patient: 'Moussa Diallo',
        movement: 'Admission',
        detail: 'Arrivée depuis les urgences',
        author: 'Agent de régulation A. Koné',
        timestamp: '10/05/2026 11:10',
    },
    {
        patient: 'Nadia Koné',
        movement: 'Sortie de circuit',
        detail: 'Demande non prioritaire',
        author: 'Secrétariat hospitalier',
        timestamp: '09/05/2026 16:45',
    },
    {
        patient: 'Koffi MENSAH',
        movement: 'Réorientation',
        detail: 'Orientation vers chirurgie',
        author: 'Dr. Claire Durand',
        timestamp: '08/05/2026 09:00',
    },
];

const serviceActivity = [
    { service: 'Médecine générale', entrants: 18, sortants: 12, mouvements: 30, charge: 72 },
    { service: 'Cardiologie', entrants: 11, sortants: 9, mouvements: 20, charge: 61 },
    { service: 'ORL', entrants: 8, sortants: 6, mouvements: 14, charge: 48 },
    { service: 'Chirurgie', entrants: 6, sortants: 5, mouvements: 11, charge: 54 },
    { service: 'Médecine interne', entrants: 4, sortants: 3, mouvements: 7, charge: 39 },
];

const auditHighlights = [
    { label: 'Transferts effectués', value: '124', trend: '+18 cette semaine', icon: 'fa-arrow-right-arrow-left' },
    { label: 'Mouvements patients', value: '286', trend: '+9% sur 7 jours', icon: 'fa-person-walking-arrow-right' },
    { label: 'Services actifs', value: '12', trend: 'Tous suivis', icon: 'fa-hospital' },
    { label: 'Alertes audit', value: '03', trend: '2 à vérifier', icon: 'fa-triangle-exclamation' },
];

const Rapports = () => {
    useEffect(() => {
        document.title = 'Audit hospitalier';
    }, []);

    return (
        <main className="audit-shell">
            <section className="audit-header">
                <div>
                    <p className="audit-eyebrow">Rapports d’audit hospitalier</p>
                    <h1>Transferts, mouvements patients et activité des services</h1>
                    <p className="audit-subtitle">
                        Vue consolidée pour contrôler qui transfère, vers quel service, avec quel médecin référent et quelle
                        charge opérationnelle.
                    </p>
                </div>
                <div className="audit-date-chip">
                    <i className="fa-regular fa-calendar-days"></i>
                    <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </section>

            <section className="audit-kpi-grid">
                {auditHighlights.map((item) => (
                    <article className="audit-kpi-card" key={item.label}>
                        <div className="audit-kpi-icon">
                            <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <div className="audit-kpi-content">
                            <span className="audit-kpi-value">{item.value}</span>
                            <span className="audit-kpi-label">{item.label}</span>
                            <span className="audit-kpi-trend">{item.trend}</span>
                        </div>
                    </article>
                ))}
            </section>

            <section className="audit-panels">
                <article className="audit-panel">
                    <div className="audit-panel-head">
                        <div>
                            <h2>Mouvements patients</h2>
                            <p>Journal des admissions, réorientations et sorties de circuit.</p>
                        </div>
                    </div>

                    <div className="movement-list">
                        {patientMovements.map((movement) => (
                            <div className="movement-item" key={`${movement.patient}-${movement.timestamp}`}>
                                <div className="movement-marker">
                                    <i className="fa-solid fa-right-left"></i>
                                </div>
                                <div className="movement-content">
                                    <div className="movement-top">
                                        <strong>{movement.patient}</strong>
                                        <span>{movement.timestamp}</span>
                                    </div>
                                    <p>{movement.movement}</p>
                                    <small>{movement.detail}</small>
                                    <span className="movement-author">{movement.author}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="audit-panel">
                    <div className="audit-panel-head">
                        <div>
                            <h2>Activité des services</h2>
                            <p>Volume des entrants, sortants et charge observée sur la période.</p>
                        </div>
                    </div>

                    <div className="activity-list">
                        {serviceActivity.map((service) => (
                            <div className="activity-row" key={service.service}>
                                <div className="activity-row-top">
                                    <strong>{service.service}</strong>
                                    <span>{service.mouvements} mouvements</span>
                                </div>
                                <div className="activity-bar">
                                    <span style={{ width: `${service.charge}%` }}></span>
                                </div>
                                <div className="activity-row-bottom">
                                    <span>Entrants: {service.entrants}</span>
                                    <span>Sortants: {service.sortants}</span>
                                    <span>Charge: {service.charge}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="audit-panels audit-panels-bottom">
                <article className="audit-panel audit-panel-wide">
                    <div className="audit-panel-head">
                        <div>
                            <h2>Transferts effectués entre services</h2>
                            <p>Historique des demandes, validation et traçabilité complète des mouvements inter-services.</p>
                        </div>
                        <span className="audit-panel-badge">Exporter</span>
                    </div>

                    <div className="table-wrapper audit-table-wrapper">
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Du service</th>
                                    <th>Vers service</th>
                                    <th>Qui a transféré</th>
                                    <th>Médecin référent</th>
                                    <th>Motif</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transferAudits.map((item) => (
                                    <tr key={item.id}>
                                        <td className="audit-id">{item.id}</td>
                                        <td>{item.patient}</td>
                                        <td>{item.fromService}</td>
                                        <td>{item.toService}</td>
                                        <td>{item.transferredBy}</td>
                                        <td>{item.referringDoctor}</td>
                                        <td>{item.reason}</td>
                                        <td>{item.date}</td>
                                        <td>
                                            <span className={`status-badge ${item.status === 'Validé' ? 'réalisé' : item.status === 'En cours' ? 'en-cours' : 'refuse'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>
        </main>
    );
};

export default Rapports;
