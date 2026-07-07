import React, { useEffect, useMemo, useState } from "react";
import { servicesApi } from "../../api/serviceApi";
import { getMesDonneesEtablissement } from "../../api/etablissementApi";
import AdminCrudPage, { apiErrorMessage, valueAt } from "../DashAdmin/AdminCrudPage.jsx";

const columns = [
  { key: "nom", label: "Nom du service", className: "table-title-cell" },
  { key: "etablissement.name", label: "Établissement" },
  { key: "description", label: "Description" },
  {
    key: "est_actif",
    label: "Statut",
    render: (row) => (
      <span className={`rdv-status ${row.est_actif ? "done" : "pending"}`}>
        {row.est_actif ? "Actif" : "Inactif"}
      </span>
    ),
  },
];

export default function ServicesHopital() {
  const [currentEtablissement, setCurrentEtablissement] = useState(null);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    getMesDonneesEtablissement()
      .then((response) => {
        const etablissement = response?.data?.etablissement ?? response?.etablissement ?? response?.data ?? null;
        setCurrentEtablissement(etablissement);
      })
      .catch((error) => setOptionsError(apiErrorMessage(error)));
  }, []);

  const fields = useMemo(() => [
    {
      name: "etablissement_name",
      label: "Établissement",
      type: "static",
      defaultValue: currentEtablissement?.nom || currentEtablissement?.name || "Etablissement connecte",
      fromRow: (row) => row.etablissement?.name || row.etablissement?.nom || currentEtablissement?.nom || currentEtablissement?.name,
    },
    { name: "nom", label: "Nom du service", required: true, fromRow: (row) => row.nom },
    { name: "email", label: "Email du service", type: "email", required: true, readOnlyOnEdit: true, showReadOnlyOnEdit: true, fromRow: (row) => row.user?.email || row.email },
    { name: "password", label: "Mot de passe par defaut", type: "password", required: true, defaultValue: "password123", readOnlyOnEdit: true },
    { name: "description", label: "Description", type: "textarea", fromRow: (row) => row.description },
    { name: "tarif_patient_simple", label: "Tarif patient simple", type: "number", min: 0, defaultValue: 5000, fromRow: (row) => row.tarif_patient_simple ?? 5000 },
    { name: "tarif_patient_assure", label: "Tarif patient assure", type: "number", min: 0, defaultValue: 2500, fromRow: (row) => row.tarif_patient_assure ?? 2500 },
  ], [currentEtablissement]);

  const buildPayload = (formData, row, mode) => {
    const payload = {
      nom: formData.nom,
      description: formData.description || null,
      tarif_patient_simple: Math.max(0, formData.tarif_patient_simple === "" ? 5000 : Number(formData.tarif_patient_simple)),
      tarif_patient_assure: Math.max(0, formData.tarif_patient_assure === "" ? 2500 : Number(formData.tarif_patient_assure)),
    };
    if (mode === "create") {
      payload.est_actif = true;
      payload.email = formData.email;
      payload.password = formData.password;
      if (currentEtablissement?.id) payload.etablissement_id = currentEtablissement.id;
    }
    return payload;
  };

  const toggleServiceStatus = async (row, loadRows) => {
    const nextStatus = !row.est_actif;
    const actionLabel = nextStatus ? "reactiver" : "desactiver";

    if (!window.confirm(`Voulez-vous ${actionLabel} ce service ?`)) return;

    try {
      setOptionsError("");
      await servicesApi.update(row.id, { est_actif: nextStatus });
      await loadRows();
    } catch (error) {
      setOptionsError(apiErrorMessage(error));
    }
  };

  return (
    <>
      {optionsError && <div className="alert alert-danger">{optionsError}</div>}
      <AdminCrudPage
        title="Services"
       
        addLabel="Ajouter un service"
        searchPlaceholder="Rechercher par service, établissement, description..."
        columns={columns}
        fields={fields}
        api={servicesApi}
        buildPayload={buildPayload}
        searchableText={(row) => `${row.nom} ${row.description || ""} ${valueAt(row, "etablissement.name", "")}`}
        canDelete={() => false}
        extraActions={(row, loadRows) => (
          <button
            className="icon-action"
            title={row.est_actif ? "Desactiver" : "Reactiver"}
            type="button"
            onClick={() => toggleServiceStatus(row, loadRows)}
          >
            <i className={`fa-solid ${row.est_actif ? "fa-ban" : "fa-power-off"}`}></i>
          </button>
        )}
      />
    </>
  );
}
