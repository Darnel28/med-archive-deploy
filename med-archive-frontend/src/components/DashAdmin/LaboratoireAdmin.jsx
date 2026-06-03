import React, { useEffect, useMemo, useState } from "react";
import { laboratoiresApi } from "../../api/laboratoireApi";
import { getUsers } from "../../api/userApi";
import AdminCrudPage, { apiErrorMessage, unwrapList, valueAt } from "./AdminCrudPage.jsx";

const columns = [
  { key: "nom_laboratoire", label: "Laboratoire", className: "table-title-cell" },
  { key: "user.name", label: "Responsable" },
  { key: "user.email", label: "Email" },
  { key: "user.telephone", label: "Téléphone" },
  { key: "etablissement.name", label: "Établissement" },
  { key: "agrement", label: "Agrément" },
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

export default function LaboratoiresAdmin() {
  const [etablissements, setEtablissements] = useState([]);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    getUsers({ role: "Responsable Etablissement", per_page: 100 })
      .then((response) => setEtablissements(unwrapList(response).rows))
      .catch((error) => setOptionsError(apiErrorMessage(error)));
  }, []);

  const fields = useMemo(() => [
    { name: "name", label: "Nom du responsable", required: true, readOnlyOnEdit: true, fromRow: (row) => valueAt(row, "user.name", "") },
    { name: "email", label: "Email responsable", type: "email", required: true, readOnlyOnEdit: true, fromRow: (row) => valueAt(row, "user.email", "") },
    {
      name: "etablissement_id",
      label: "Établissement",
      type: "select",
      required: true,
      readOnlyOnEdit: true,
      options: etablissements.map((item) => ({ value: item.id, label: item.name })),
      fromRow: (row) => row.etablissement_id || row.etablissement?.id,
    },
    { name: "nom_laboratoire", label: "Nom du laboratoire", required: true, fromRow: (row) => row.nom_laboratoire },
    { name: "agrement", label: "Numéro d'agrément", required: true, fromRow: (row) => row.agrement },
    { name: "telephone", label: "Téléphone", required: true, fromRow: (row) => valueAt(row, "user.telephone", "") },
    { name: "adresse", label: "Adresse", type: "textarea", required: true, fromRow: (row) => valueAt(row, "user.adresse", "") },
    {
      name: "specialites_analyse",
      label: "Spécialités d'analyse",
      type: "textarea",
      placeholder: "Une spécialité par ligne",
      fromRow: (row) => Array.isArray(row.specialites_analyse) ? row.specialites_analyse.join("\n") : "",
    },
    { name: "est_actif", label: "État", type: "checkbox", defaultValue: true, fromRow: (row) => Boolean(row.est_actif) },
  ], [etablissements]);

  const buildPayload = (formData, row, mode) => {
    const payload = {
      nom_laboratoire: formData.nom_laboratoire,
      agrement: formData.agrement,
      telephone: formData.telephone,
      adresse: formData.adresse,
      specialites_analyse: String(formData.specialites_analyse || "")
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      est_actif: Boolean(formData.est_actif),
    };

    if (mode === "create") {
      payload.name = formData.name;
      payload.email = formData.email;
      payload.etablissement_id = formData.etablissement_id;
    }

    return payload;
  };

  return (
    <>
      {optionsError && <div className="alert alert-danger">{optionsError}</div>}
      <AdminCrudPage
        title="Gestion des laboratoires d'analyses"
       
        addLabel="Ajouter un laboratoire"
        searchPlaceholder="Rechercher par laboratoire, responsable, établissement..."
        columns={columns}
        fields={fields}
        api={laboratoiresApi}
        buildPayload={buildPayload}
        searchableText={(row) => `${row.nom_laboratoire} ${row.agrement} ${valueAt(row, "user.name", "")} ${valueAt(row, "etablissement.name", "")}`}
      />
    </>
  );
}
