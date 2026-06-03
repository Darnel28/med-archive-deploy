import React from "react";
import { parametresApi } from "../../api/parametreApi";
import AdminCrudPage from "./AdminCrudPage.jsx";

const columns = [
  { key: "cle", label: "Clé", className: "table-title-cell" },
  { key: "valeur", label: "Valeur" },
  { key: "type", label: "Type" },
  { key: "description", label: "Description" },
];

const fields = [
  { name: "cle", label: "Clé", required: true, readOnlyOnEdit: true, fromRow: (row) => row.cle },
  { name: "valeur", label: "Valeur", required: true, type: "textarea", rows: 2, fromRow: (row) => row.valeur },
  {
    name: "type",
    label: "Type",
    type: "select",
    required: true,
    defaultValue: "string",
    options: [
      { value: "string", label: "Texte" },
      { value: "integer", label: "Nombre" },
      { value: "boolean", label: "Booléen" },
      { value: "json", label: "JSON" },
    ],
    fromRow: (row) => row.type || "string",
  },
  { name: "description", label: "Description", type: "textarea", fromRow: (row) => row.description },
];

export default function ParametresAdmin() {
  const buildPayload = (formData, row, mode) => {
    const payload = {
      valeur: formData.valeur,
      type: formData.type || "string",
      description: formData.description || null,
    };
    if (mode === "create") payload.cle = formData.cle;
    return payload;
  };

  return (
    <AdminCrudPage
      title="Paramètres système"
      subtitle="Configuration globale utilisée par l'application."
      addLabel="Ajouter un paramètre"
      searchPlaceholder="Rechercher par clé, valeur, type..."
      columns={columns}
      fields={fields}
      api={parametresApi}
      buildPayload={buildPayload}
    />
  );
}
