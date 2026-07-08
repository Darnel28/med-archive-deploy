import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../assets/css/DashboardAdmin.css";
import Pagination, { DEFAULT_PAGE_SIZE, paginateRows } from "../shared/Pagination.jsx";

export function unwrapList(response) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return { rows: payload, total: payload.length };
  if (Array.isArray(payload?.data)) return { rows: payload.data, total: payload.total ?? payload.data.length };
  if (Array.isArray(payload?.data?.data)) {
    return { rows: payload.data.data, total: payload.data.total ?? payload.data.data.length };
  }
  if (Array.isArray(response?.data?.data)) {
    return { rows: response.data.data, total: response.data.total ?? response.data.data.length };
  }
  return { rows: [], total: 0 };
}

export function unwrapItem(response) {
  return response?.data?.data ?? response?.data ?? response;
}

export function apiErrorMessage(error) {
  const errors = error?.response?.data?.errors;
  if (errors) {
    return Object.values(errors).flat().join(" ");
  }
  return error?.response?.data?.message || error?.message || "Une erreur est survenue.";
}

export function valueAt(row, path, fallback = "-") {
  const value = String(path)
    .split(".")
    .reduce((current, key) => (current == null ? undefined : current[key]), row);
  return value ?? fallback;
}

function normalizeInitialForm(fields, row) {
  return fields.reduce((acc, field) => {
    if (field.readOnlyOnEdit && row && !field.showReadOnlyOnEdit) return acc;
    const value = row ? field.fromRow?.(row) ?? valueAt(row, field.name, "") : field.defaultValue ?? "";
    acc[field.name] = value ?? "";
    return acc;
  }, {});
}

export default function AdminCrudPage({
  title,
  subtitle,
  addLabel,
  searchPlaceholder = "Rechercher...",
  columns,
  fields,
  api,
  listParams,
  mapRows,
  searchableText,
  buildPayload,
  getRowId = (row) => row.id,
  canDelete = () => true,
  extraActions,
}) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const listParamsKey = JSON.stringify(listParams || {});

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.list({ per_page: 1000, ...(JSON.parse(listParamsKey) || {}) });
      const { rows: nextRows, total: nextTotal } = unwrapList(response);
      const mapped = mapRows ? nextRows.map(mapRows) : nextRows;
      setRows(mapped);
      setTotal(nextTotal || mapped.length);
      setPage(1);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [api, listParamsKey, mapRows]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    if (!error && !success) return undefined;
    const timer = window.setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [error, success]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      const text = searchableText
        ? searchableText(row)
        : columns.map((column) => column.searchValue?.(row) ?? column.render?.(row) ?? valueAt(row, column.key, "")).join(" ");
      return String(text).toLowerCase().includes(term);
    });
  }, [columns, rows, searchTerm, searchableText]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const paginatedRows = useMemo(() => paginateRows(filteredRows, page, DEFAULT_PAGE_SIZE), [filteredRows, page]);

  const openCreate = () => {
    setSelectedRow(null);
    setFormData(normalizeInitialForm(fields, null));
    setFormErrors({});
    setModalMode("create");
  };

  const openEdit = (row) => {
    setSelectedRow(row);
    setFormData(normalizeInitialForm(fields, row));
    setFormErrors({});
    setModalMode("edit");
  };

  const openDetails = (row) => {
    setSelectedRow(row);
    setModalMode("details");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedRow(null);
    setFormErrors({});
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    fields.forEach((field) => {
      if (field.readOnlyOnEdit && modalMode === "edit") return;
      if (field.required && !String(formData[field.name] ?? "").trim()) {
        errors[field.name] = "Champ requis";
      }
      if (field.type === "email" && formData[field.name] && !/\S+@\S+\.\S+/.test(formData[field.name])) {
        errors[field.name] = "Email invalide";
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const payload = buildPayload ? buildPayload(formData, selectedRow, modalMode) : formData;
      let response;
      if (modalMode === "edit") {
        response = await api.update(getRowId(selectedRow), payload);
      } else {
        response = await api.create(payload);
      }
      closeModal();
      await loadRows();
      const warning = response?.data?.warning || response?.warning;
      setSuccess(warning || response?.message || "Enregistrement effectue avec succes.");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Supprimer cet élément ?")) return;
    setError("");
    try {
      const response = await api.remove(getRowId(row));
      await loadRows();
      setSuccess(response?.message || "Suppression effectuee avec succes.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>{title}</h1>
        {subtitle && <p className="table-meta">{subtitle}</p>}
      </section>

      <div className="table-toolbar">
        <label className="table-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
        <button className="btn transfer-add-btn" type="button" onClick={openCreate}>
          <i ></i> {addLabel}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <section className="rdv-section">
        <article className="rdv-card">
          <div className="rdv-table-wrap">
            <table className="rdv-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.key || column.label}>{column.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center p-4">
                      Chargement...
                    </td>
                  </tr>
                )}
                {!loading && paginatedRows.rows.map((row) => (
                  <tr key={getRowId(row)}>
                    {columns.map((column) => (
                      <td key={column.key || column.label} className={column.className}>
                        {column.render ? column.render(row) : valueAt(row, column.key)}
                      </td>
                    ))}
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action" title="Voir" type="button" onClick={() => openDetails(row)}>
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button className="icon-action" title="Modifier" type="button" onClick={() => openEdit(row)}>
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      {extraActions?.(row, loadRows)}
                      {canDelete(row) && (
                        <button className="icon-action" title="Supprimer" type="button" onClick={() => handleDelete(row)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center p-4">
                      Aucun résultat trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="table-footer">
            <span className="table-meta">
              {filteredRows.length === 0 ? 0 : paginatedRows.start + 1}-{paginatedRows.end} affiché(s) sur {filteredRows.length} ({total || rows.length} au total)
            </span>
            <Pagination page={paginatedRows.page} totalItems={filteredRows.length} onPageChange={setPage} />
          </div>
        </article>
      </section>

      {modalMode && (
        <div className="modal-overlay admin-modal-overlay" onClick={closeModal}>
          <div className="modal-container admin-modal-container" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalMode === "details" ? "Détails" : modalMode === "edit" ? "Modifier" : addLabel}
              </h3>
              <button className="modal-close" type="button" onClick={closeModal}>
                &times;
              </button>
            </div>

            {modalMode === "details" ? (
              <div className="modal-body">
                {columns.map((column) => (
                  <div className="form-group" key={column.key || column.label}>
                    <label>{column.label}</label>
                    <div className="table-meta">{column.render ? column.render(selectedRow) : valueAt(selectedRow, column.key)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {fields.map((field) => {
                    if (field.readOnlyOnEdit && modalMode === "edit" && !field.showReadOnlyOnEdit) return null;
                    const commonProps = {
                      name: field.name,
                      value: formData[field.name] ?? "",
                      onChange: handleChange,
                      className: formErrors[field.name] ? "error" : "",
                      placeholder: field.placeholder,
                      min: field.min,
                      readOnly: field.readOnly || (field.readOnlyOnEdit && modalMode === "edit"),
                    };

                    return (
                      <div className="form-group" key={field.name}>
                        <label>{field.label} {field.required && <span className="text-danger">*</span>}</label>
                        {field.type === "select" ? (
                          <select {...commonProps}>
                            <option value="">-- Sélectionner --</option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea {...commonProps} rows={field.rows || 3}></textarea>
                        ) : field.type === "static" ? (
                          <div className="form-static-value">{formData[field.name] || field.fallback || "-"}</div>
                        ) : field.type === "checkbox" ? (
                          <label className="table-meta">
                            <input
                              type="checkbox"
                              name={field.name}
                              checked={Boolean(formData[field.name])}
                              onChange={handleChange}
                            />{" "}
                            {field.checkboxLabel || "Actif"}
                          </label>
                        ) : (
                          <input {...commonProps} type={field.type || "text"} />
                        )}
                        {formErrors[field.name] && <span className="error-message">{formErrors[field.name]}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-outline" type="button" onClick={closeModal}>
                    Annuler
                  </button>
                  <button className="btn btn-solid" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
