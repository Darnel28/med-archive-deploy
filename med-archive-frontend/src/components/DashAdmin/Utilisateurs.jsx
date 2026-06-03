import React, { useEffect, useMemo, useState } from "react";
import { activerUser, desactiverUser, usersApi } from "../../api/userApi";
import { getRoles } from "../../api/roleApi";
import AdminCrudPage, { apiErrorMessage, valueAt } from "./AdminCrudPage.jsx";

const userColumns = [
  { key: "name", label: "Nom", className: "table-title-cell" },
  { key: "email", label: "Email" },
  { key: "telephone", label: "Téléphone" },
  { key: "role.nom", label: "Rôle" },
  {
    key: "statut",
    label: "Statut",
    render: (row) => (
      <span className={`rdv-status ${row.statut === "actif" ? "done" : row.statut === "en_attente" ? "pending" : "cancelled"}`}>
        {row.statut || "-"}
      </span>
    ),
  },
  { key: "etablissement.name", label: "Établissement" },
];

export default function Utilisateurs() {
  const [roles, setRoles] = useState([]);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    getRoles()
      .then((response) => setRoles(response?.data ?? response ?? []))
      .catch((error) => setRoleError(apiErrorMessage(error)));
  }, []);

  const fields = useMemo(() => [
    { name: "name", label: "Nom complet", required: true, fromRow: (row) => row.name },
    { name: "email", label: "Email", type: "email", required: true, fromRow: (row) => row.email },
    { name: "telephone", label: "Téléphone", fromRow: (row) => row.telephone },
    { name: "adresse", label: "Adresse", type: "textarea", fromRow: (row) => row.adresse },
    {
      name: "role_id",
      label: "Rôle",
      type: "select",
      required: true,
      options: roles.map((role) => ({ value: role.id, label: role.nom })),
      fromRow: (row) => row.role_id || row.role?.id,
    },
    {
      name: "statut",
      label: "Statut",
      type: "select",
      required: true,
      defaultValue: "actif",
      options: [
        { value: "actif", label: "Actif" },
        { value: "inactif", label: "Inactif" },
        { value: "en_attente", label: "En attente" },
      ],
      fromRow: (row) => row.statut || "actif",
    },
    { name: "password", label: "Mot de passe", type: "password", required: true, readOnlyOnEdit: true },
  ], [roles]);

  const buildPayload = (formData, row, mode) => {
    const payload = {
      name: formData.name,
      email: formData.email,
      telephone: formData.telephone || null,
      adresse: formData.adresse || null,
      role_id: formData.role_id,
      statut: formData.statut || "actif",
    };

    if (mode === "create") {
      payload.password = formData.password;
      payload.password_confirmation = formData.password;
    }

    return payload;
  };

  const extraActions = (row, reload) => (
    <button
      className="icon-action"
      title={row.statut === "actif" ? "Désactiver" : "Activer"}
      type="button"
      onClick={async () => {
        if (row.statut === "actif") await desactiverUser(row.id);
        else await activerUser(row.id);
        await reload();
      }}
    >
      <i className={`fa-solid ${row.statut === "actif" ? "fa-user-slash" : "fa-user-check"}`}></i>
    </button>
  );

  return (
    <>
      {roleError && <div className="alert alert-danger">{roleError}</div>}
      <AdminCrudPage
        title="Gestion des utilisateurs"
       
        addLabel="Ajouter un utilisateur"
        searchPlaceholder="Rechercher par nom, email, téléphone, rôle..."
        columns={userColumns}
        fields={fields}
        api={usersApi}
        buildPayload={buildPayload}
        searchableText={(row) => `${row.name} ${row.email} ${row.telephone || ""} ${valueAt(row, "role.nom", "")}`}
        extraActions={extraActions}
      />
    </>
  );
}
