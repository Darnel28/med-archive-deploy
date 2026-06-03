import React from "react";
import { usersApi } from "../../api/userApi";
import AdminCrudPage, { valueAt } from "./AdminCrudPage.jsx";

const columns = [
  { key: "name", label: "Nom", className: "table-title-cell" },
  { key: "telephone", label: "Téléphone" },
  { key: "email", label: "Email" },
  { key: "adresse", label: "Adresse" },
  { key: "information_etablissement.type_etablissement", label: "Type" },
  { key: "information_etablissement.directeur_nom", label: "Directeur" },
  {
    key: "statut",
    label: "Statut",
    render: (row) => (
      <span className={`rdv-status ${row.statut === "actif" ? "done" : "pending"}`}>
        {row.statut || "-"}
      </span>
    ),
  },
];

const fields = [
  { name: "name", label: "Nom de l'établissement", required: true, fromRow: (row) => row.name },
  { name: "email", label: "Email", type: "email", required: true, fromRow: (row) => row.email },
  { name: "telephone", label: "Téléphone", fromRow: (row) => row.telephone },
  { name: "adresse", label: "Adresse", type: "textarea", fromRow: (row) => row.adresse },
  {
    name: "type_etablissement",
    label: "Type d'établissement",
    type: "select",
    required: true,
    defaultValue: "hopital",
    options: [
      { value: "hopital", label: "Hôpital" },
      { value: "clinique", label: "Clinique" },
      { value: "cabinet", label: "Cabinet" },
      { value: "laboratoire", label: "Laboratoire" },
    ],
    fromRow: (row) => valueAt(row, "information_etablissement.type_etablissement", "hopital"),
  },
  { name: "code_etablissement", label: "Code établissement", fromRow: (row) => valueAt(row, "information_etablissement.code_etablissement", "") },
  { name: "registre_commerce", label: "Registre commerce", fromRow: (row) => valueAt(row, "information_etablissement.registre_commerce", "") },
  { name: "directeur_nom", label: "Directeur", fromRow: (row) => valueAt(row, "information_etablissement.directeur_nom", "") },
  { name: "password", label: "Mot de passe", type: "password", required: true, readOnlyOnEdit: true },
];

export default function Hopitaux() {
  const buildPayload = (formData, row, mode) => {
    const payload = {
      name: formData.name,
      email: formData.email,
      telephone: formData.telephone || null,
      adresse: formData.adresse || null,
      role: "Responsable Etablissement",
      statut: row?.statut || "actif",
      type_etablissement: formData.type_etablissement || "hopital",
      code_etablissement: formData.code_etablissement || null,
      registre_commerce: formData.registre_commerce || null,
      directeur_nom: formData.directeur_nom || null,
    };

    if (mode === "create") {
      payload.password = formData.password;
      payload.password_confirmation = formData.password;
    }

    return payload;
  };

  return (
    <AdminCrudPage
      title="Gestion des hôpitaux"
    
      addLabel="Ajouter un hôpital"
      searchPlaceholder="Rechercher par nom, email, type, directeur..."
      columns={columns}
      fields={fields}
      api={usersApi}
      listParams={{ role: "Responsable Etablissement" }}
      buildPayload={buildPayload}
      searchableText={(row) => `${row.name} ${row.email} ${row.telephone || ""} ${valueAt(row, "information_etablissement.type_etablissement", "")} ${valueAt(row, "information_etablissement.directeur_nom", "")}`}
    />
  );
}
