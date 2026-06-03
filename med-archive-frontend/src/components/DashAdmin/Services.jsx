import React, { useEffect, useMemo, useState } from "react";
import { servicesApi } from "../../api/serviceApi";
import { getUsers } from "../../api/userApi";
import AdminCrudPage, { apiErrorMessage, unwrapList, valueAt } from "./AdminCrudPage.jsx";

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

export default function ServicesAdmin() {
  const [etablissements, setEtablissements] = useState([]);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    getUsers({ role: "Responsable Etablissement", per_page: 100 })
      .then((response) => setEtablissements(unwrapList(response).rows))
      .catch((error) => setOptionsError(apiErrorMessage(error)));
  }, []);

  const fields = useMemo(() => [
    {
      name: "etablissement_id",
      label: "Établissement",
      type: "select",
      required: true,
      readOnlyOnEdit: true,
      options: etablissements.map((item) => ({ value: item.id, label: item.name })),
      fromRow: (row) => row.etablissement_id || row.etablissement?.id,
    },
    { name: "nom", label: "Nom du service", required: true, fromRow: (row) => row.nom },
    { name: "description", label: "Description", type: "textarea", fromRow: (row) => row.description },
    { name: "est_actif", label: "État", type: "checkbox", defaultValue: true, fromRow: (row) => Boolean(row.est_actif) },
  ], [etablissements]);

  const buildPayload = (formData, row, mode) => {
    const payload = {
      nom: formData.nom,
      description: formData.description || null,
      est_actif: Boolean(formData.est_actif),
    };
    if (mode === "create") payload.etablissement_id = formData.etablissement_id;
    return payload;
  };

  return (
    <>
      {optionsError && <div className="alert alert-danger">{optionsError}</div>}
      <AdminCrudPage
        title="Gestion des services médicaux"
       
        addLabel="Ajouter un service"
        searchPlaceholder="Rechercher par service, établissement, description..."
        columns={columns}
        fields={fields}
        api={servicesApi}
        buildPayload={buildPayload}
        searchableText={(row) => `${row.nom} ${row.description || ""} ${valueAt(row, "etablissement.name", "")}`}
      />
    </>
  );
}
