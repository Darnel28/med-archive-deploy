import React, { useEffect, useMemo, useState } from 'react';
import { getRapportsAdmin } from '../../api/statistiqueApi';
import { apiErrorMessage } from './AdminCrudPage.jsx';
import '../../assets/css/Hopital.css';

function rows(value) {
    return Array.isArray(value) ? value : [];
}

function dateTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

function dateOnly(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('fr-FR');
}

function lastActivityLabel(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return `Aujourd'hui ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Hier ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return dateTime(value);
}

const RapportAdmin = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = 'Rapports administrateur';
    }, []);

    useEffect(() => {
        let mounted = true;

        async function loadReport() {
            try {
                const response = await getRapportsAdmin();
                if (!mounted) return;
                setReport(response?.data ?? response);
                setError('');
            } catch (err) {
                if (mounted) setError(apiErrorMessage(err));
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadReport();
        return () => {
            mounted = false;
        };
    }, []);

    const kpis = report?.kpis ?? {};
    const auditHighlights = useMemo(() => [
        {
            label: 'Utilisateurs créés',
            value: kpis.utilisateurs_crees ?? 0,
            trend: `+${kpis.utilisateurs_crees_semaine ?? 0} cette semaine`,
            icon: 'fa-users',
        },
        {
            label: 'Hôpitaux connectés',
            value: kpis.hopitaux_connectes ?? 0,
            trend: 'Etablissements enregistrés',
            icon: 'fa-hospital',
        },
        {
            label: "Connexions aujourd'hui",
            value: kpis.connexions_aujourdhui ?? 0,
            trend: 'Journal système',
            icon: 'fa-right-to-bracket',
        },
        {
            label: 'Alertes de sécurité',
            value: String(kpis.alertes_securite ?? 0).padStart(2, '0'),
            trend: 'A traiter',
            icon: 'fa-triangle-exclamation',
        },
    ], [kpis]);

    return (
        <main className="audit-shell">
            <section className="audit-header">
                <div>
                    <p className="audit-eyebrow">Rapports d'audit de la plateforme</p>
                    <h1>Sécurité, administration et traçabilité du système Med-Archive</h1>
                    <p className="audit-subtitle">
                        Vue consolidée des activités administratives, des accès au système et de l'état des établissements connectés.
                    </p>
                </div>
                <div className="audit-date-chip">
                    <i className="fa-regular fa-calendar-days"></i>
                    <span>{new Date(report?.date ?? Date.now()).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </section>

            {error ? <p className="alert alert-danger">{error}</p> : null}
            {loading ? <p className="table-meta p-4">Chargement...</p> : null}

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

            <section className="audit-panels audit-panels-bottom">
                <article className="audit-panel audit-panel-wide">
                    <div className="audit-panel-head">
                        <div>
                            <h2>Activités administratives récentes</h2>
                            <p>Journal des actions réalisées par les administrateurs de la plateforme.</p>
                        </div>
                    </div>
                    <div className="table-wrapper audit-table-wrapper">
                        <table className="audit-table">
                            <thead>
                                <tr><th>Date</th><th>Administrateur</th><th>Action</th><th>Détails</th></tr>
                            </thead>
                            <tbody>
                                {rows(report?.activites_administratives).map((item) => (
                                    <tr key={item.id}>
                                        <td>{dateTime(item.date)}</td>
                                        <td>{item.administrateur}</td>
                                        <td>{item.action}</td>
                                        <td>{item.details}</td>
                                    </tr>
                                ))}
                                {!loading && rows(report?.activites_administratives).length === 0 ? (
                                    <tr><td colSpan="4">Aucune activité administrative.</td></tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>

            <section className="audit-panels">
                <article className="audit-panel">
                    <div className="audit-panel-head">
                        <div>
                            <h2>État des établissements</h2>
                            <p>Suivi des établissements enregistrés sur la plateforme.</p>
                        </div>
                    </div>
                    <div className="table-wrapper audit-table-wrapper">
                        <table className="audit-table">
                            <thead>
                                <tr><th>Établissement</th><th>Statut</th><th>Utilisateurs</th><th>Dernière activité</th></tr>
                            </thead>
                            <tbody>
                                {rows(report?.etablissements).map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nom}</td>
                                        <td><span className={`status-badge ${item.statut === 'En ligne' ? 'réalisé' : 'refuse'}`}>{item.statut}</span></td>
                                        <td>{item.utilisateurs}</td>
                                        <td>{lastActivityLabel(item.derniere_activite)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>

                <article className="audit-panel">
                    <div className="audit-panel-head">
                        <div>
                            <h2>Activité des utilisateurs</h2>
                            <p>Répartition des comptes actifs.</p>
                        </div>
                    </div>
                    <div className="activity-list">
                        {rows(report?.activite_utilisateurs).map((item) => (
                            <div className="activity-row" key={item.role}>
                                <div className="activity-row-top">
                                    <strong>{item.role}</strong>
                                    <span>{item.total}</span>
                                </div>
                                <div className="activity-bar">
                                    <span style={{ width: `${Math.min(100, Math.max(8, item.total))}%` }}></span>
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
                            <h2>Journal de sécurité</h2>
                            <p>Connexions sensibles, incidents système et alertes critiques.</p>
                        </div>
                    </div>
                    <div className="table-wrapper audit-table-wrapper">
                        <table className="audit-table">
                            <thead>
                                <tr><th>Date</th><th>Événement</th><th>Utilisateur</th><th>Résultat</th></tr>
                            </thead>
                            <tbody>
                                {rows(report?.journal_securite).map((item) => (
                                    <tr key={item.id}>
                                        <td>{dateTime(item.date)}</td>
                                        <td>{item.evenement}</td>
                                        <td>{item.utilisateur}</td>
                                        <td>{item.resultat}</td>
                                    </tr>
                                ))}
                                {!loading && rows(report?.journal_securite).length === 0 ? (
                                    <tr><td colSpan="4">Aucun événement de sécurité.</td></tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </article>
            </section>

            <section className="audit-panels">
                <article className="audit-panel">
                    <div className="audit-panel-head">
                        <div>
                            <h2>Gestion des hôpitaux</h2>
                            <p>Historique des actions réalisées sur les établissements.</p>
                        </div>
                    </div>
                    <div className="table-wrapper audit-table-wrapper">
                        <table className="audit-table">
                            <thead>
                                <tr><th>Date</th><th>Action</th><th>Établissement</th><th>Réalisé par</th></tr>
                            </thead>
                            <tbody>
                                {rows(report?.gestion_hopitaux).map((item) => (
                                    <tr key={item.id}>
                                        <td>{dateOnly(item.date)}</td>
                                        <td>{item.action}</td>
                                        <td>{item.etablissement}</td>
                                        <td>{item.realise_par}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>

                <article className="audit-panel">
                    <div className="audit-panel-head">
                        <div>
                            <h2>Alertes système</h2>
                            <p>Alertes critiques visibles par l'administration plateforme.</p>
                        </div>
                    </div>
                    <div className="movement-list">
                        {rows(report?.alertes_systeme).map((item) => (
                            <div className="movement-item" key={item.id}>
                                <div className="movement-marker">
                                    <i className="fa-solid fa-triangle-exclamation"></i>
                                </div>
                                <div className="movement-content">
                                    <div className="movement-top">
                                        <strong>{item.title}</strong>
                                        <span>{dateTime(item.created_at)}</span>
                                    </div>
                                    <p>{item.body}</p>
                                </div>
                            </div>
                        ))}
                        {!loading && rows(report?.alertes_systeme).length === 0 ? (
                            <p className="table-meta p-4">Aucune alerte système active.</p>
                        ) : null}
                    </div>
                </article>
            </section>
        </main>
    );
};

export default RapportAdmin;
