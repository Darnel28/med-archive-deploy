import React, { useEffect, useMemo, useState } from 'react';
import { getAnalyseResultatFichier, getMesAnalyses } from '../../api/patientApi';

const unwrapRows = (payload) => {
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString('fr-FR') : '-';

const fileName = (path) => String(path || '').split(/[\\/]/).pop() || 'Document medical';
const isImage = (path) => /\.(png|jpe?g|gif|webp|bmp)$/i.test(String(path || ''));

const DocumentsMedicaux = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      setLoading(true);
      setMessage('');
      try {
        const response = await getMesAnalyses({ per_page: 100 });
        const rows = unwrapRows(response)
          .filter((analysis) => analysis.fichier_resultat)
          .map((analysis) => ({
            id: analysis.id,
            name: fileName(analysis.fichier_resultat),
            type: analysis.type_analyse || 'Resultat d analyse',
            date: analysis.date_resultat || analysis.updated_at || analysis.created_at,
            isImage: isImage(analysis.fichier_resultat),
          }));
        if (active) setDocuments(rows);
      } catch (error) {
        if (active) {
          setMessage(error?.response?.data?.message || 'Impossible de charger les documents medicaux.');
          setDocuments([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDocuments();
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const folders = useMemo(() => {
    const images = documents.filter((document) => document.isImage).length;
    const others = documents.length - images;
    return [
      { label: 'Images', count: images, icon: 'fa-regular fa-images' },
      { label: 'Comptes rendus', count: others, icon: 'fa-regular fa-file-lines' },
      { label: 'Tous les documents', count: documents.length, icon: 'fa-solid fa-folder' },
    ];
  }, [documents]);

  const createDocumentUrl = async (document) => {
    const response = await getAnalyseResultatFichier(document.id);
    return URL.createObjectURL(response.data);
  };

  const openPreview = async (document) => {
    setPreview(document);
    setPreviewLoading(true);
    setMessage('');

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }

    try {
      const url = await createDocumentUrl(document);
      setPreviewUrl(url);
    } catch (error) {
      setPreview(null);
      setMessage(error?.response?.data?.message || 'Impossible d afficher ce document.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreview(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const openDocument = async (document) => {
    setMessage('');
    try {
      const url = await createDocumentUrl(document);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Impossible d ouvrir ce document.');
    }
  };

  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Documents medicaux</h1>
      </section>

      {message && <p className="form-message">{message}</p>}

      <section className="docsfm-storage">
        <div className="docsfm-storage-info">
          <span><strong>{documents.length}</strong> documents disponibles</span>
          <div className="docsfm-storage-track" aria-hidden="true">
            <span className="docsfm-storage-fill" style={{ width: `${Math.min(documents.length * 10, 100)}%` }}></span>
          </div>
        </div>
      </section>

      <section className="docsfm-layout">
        <div className="docsfm-main">
          {/* <h2 className="docsfm-title">Dossiers</h2> */}
          <div className="docsfm-folder-grid">
            {folders.map((folder) => (
              <article className="docsfm-folder-card" key={folder.label}>
                <div className="docsfm-folder-top">
                  <input type="checkbox" aria-label={`Selectionner ${folder.label}`} />
                  <button className="docsfm-more"><i className="fa-solid fa-ellipsis-vertical"></i></button>
                </div>
                <i className={`${folder.icon} docsfm-folder-icon`}></i>
                <h3>{folder.label}</h3>
                <div className="docsfm-folder-meta">
                  <span><strong>{folder.count}</strong> fichier(s)</span>
                </div>
              </article>
            ))}
          </div>

          <h2 className="docsfm-title" style={{ marginTop: '24px' }}>Fichiers recents</h2>
          <article className="rdv-card docsfm-table-card">
            <div className="rdv-table-wrap">
              <table className="rdv-table docsfm-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Element</th>
                    <th>Date recente</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Chargement...</td></tr>}
                  {!loading && documents.map((document) => (
                    <tr key={document.id}>
                      <td className="docsfm-file-name">
                        <i className={document.isImage ? 'fa-regular fa-image' : 'fa-regular fa-file-lines'}></i> {document.name}
                      </td>
                      <td>{document.type}</td>
                      <td>{formatDate(document.date)}</td>
                      <td className="rdv-actions table-actions-compact">
                        {/* <button className="icon-action" title="Voir" onClick={() => openPreview(document)}>
                          <i className="fa-regular fa-eye"></i>
                        </button> */}
                        <button
    className="icon-action"
    title="Voir"
    onClick={() => openDocument(document)}
>
    <i className="fa-regular fa-eye"></i>
</button>
                        <button className="icon-action" title="Ouvrir" onClick={() => openDocument(document)}>
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && documents.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center' }}>Aucun document medical disponible</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="docsfm-side">
          <div className="docsfm-side-head">
            <h3>Vue d'ensemble</h3>
          </div>
          <div className="docsfm-donut" aria-hidden="true"></div>
          <ul className="docsfm-legend">
            <li><span className="dot radios"></span> Images <strong>{folders[0].count}</strong></li>
            <li><span className="dot autres"></span> Autres <strong>{folders[1].count}</strong></li>
          </ul>
        </aside>
      </section>

      {/* {preview && (
        <div className="document-modal-backdrop" onClick={closePreview}>
          <div className="document-modal" onClick={(event) => event.stopPropagation()}>
            <div className="document-modal-header">
              <div>
                <span className="document-modal-kicker">{preview.type}</span>
                <h2>{preview.name}</h2>
              </div>
              <button className="document-modal-close" title="Fermer" onClick={closePreview}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="document-preview-frame">
              {previewLoading && <div className="document-preview-loading">Chargement du document...</div>}
              {!previewLoading && preview.isImage && previewUrl && (
                <img src={previewUrl} alt={preview.name} className="document-preview-image" />
              )}
              {!previewLoading && !preview.isImage && previewUrl && (
                <iframe src={previewUrl} title={preview.name} className="document-preview-pdf"></iframe>
              )}
            </div>

            <div className="document-modal-actions">
              <button className="btn btn-outline" onClick={closePreview}>Fermer</button>
              <button className="btn btn-solid" onClick={() => openDocument(preview)}>
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                Ouvrir
              </button>
            </div>
          </div>
        </div>
      )} */}

      <style>{`
       .document-modal-backdrop{
    position:fixed;
    inset:0;
    z-index:100000;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:32px;
    background:rgba(15,23,42,.55);
    backdrop-filter:blur(8px);
    animation:fadeIn .25s ease;
}

.document-modal{
    width:min(900px,90vw);
    max-height:85vh;

    display:flex;
    flex-direction:column;

    overflow:hidden;

    border-radius:22px;

    background:#fff;

    box-shadow:0 30px 80px rgba(15,23,42,.20);
}

.document-modal-header{

    display:flex;
    justify-content:space-between;
    align-items:flex-start;

    padding:24px 30px;

    border-bottom:1px solid #edf2f7;

    background:white;
}

.document-modal-kicker{

    display:inline-flex;
    align-items:center;
    gap:8px;

    color:#14b8a6;

    font-size:14px;

    font-weight:700;

    letter-spacing:.4px;

    text-transform:uppercase;
}

.document-modal h2{

    margin:8px 0 0;

    color:#1f2937;

    font-size:24px;

    font-weight:600;

    line-height:1.35;

    overflow-wrap:anywhere;
}

.document-modal-close{

    width:48px;

    height:48px;

    border:none;

    border-radius:50%;

    background:#f3f6fa;

    color:#475569;

    cursor:pointer;

    font-size:22px;

    transition:.25s;
}

.document-modal-close:hover{

    background:#14b8a6;

    color:white;

    transform:rotate(90deg);
}

.document-preview-frame{

    min-height:420px;
    max-height:58vh;

    display:flex;
    justify-content:center;
    align-items:center;

    padding:20px;

    background:#f5f7fb;
}

.document-preview-loading{

    font-size:18px;

    color:#64748b;

    font-weight:600;
}

.document-preview-image{

    max-width:100%;

    max-height:100%;

    object-fit:contain;

    border-radius:16px;

    background:white;

    box-shadow:
        0 20px 45px rgba(15,23,42,.12);
}

.document-preview-pdf{

    width:100%;

    height:100%;

    border:none;

    border-radius:16px;

    background:white;

    box-shadow:
        0 20px 45px rgba(15,23,42,.12);
}

.document-modal-actions{

    display:flex;

    justify-content:flex-end;

    align-items:center;

    gap:16px;

    padding:22px 30px;

    border-top:1px solid #edf2f7;

    background:white;
}

.document-modal-actions .btn{

    height:50px;

    padding:0 28px;

    border-radius:30px;

    font-size:16px;

    font-weight:600;

    transition:.25s;
}

.document-modal-actions .btn-outline{

    background:white;

    border:2px solid #dbe4ea;

    color:#334155;
}

.document-modal-actions .btn-outline:hover{

    background:#f8fafc;

    border-color:#14b8a6;

    color:#14b8a6;
}

.document-modal-actions .btn-solid{

    display:flex;

    align-items:center;

    justify-content:center;

    gap:10px;

    border:none;

    color:white;

    background:linear-gradient(135deg,#16c4b5,#0f9d92);

    box-shadow:0 12px 25px rgba(20,184,166,.30);
}

.document-modal-actions .btn-solid:hover{

    transform:translateY(-2px);

    box-shadow:0 18px 35px rgba(20,184,166,.40);
}

.document-modal-actions i{

    font-size:15px;
}

@keyframes fadeIn{

    from{
        opacity:0;
    }

    to{
        opacity:1;
    }
}

@keyframes modalUp{

    from{

        opacity:0;

        transform:translateY(25px) scale(.97);
    }

    to{

        opacity:1;

        transform:translateY(0) scale(1);
    }
}

@media(max-width:900px){

    .document-modal{

        width:100%;

        height:100vh;

        max-height:100vh;

        border-radius:0;
    }

    .document-preview-frame{

        padding:15px;
    }

  .document-modal-header{
    padding:18px 24px;
}

.document-modal-actions{
    padding:16px 24px;
}

    .document-modal-actions .btn{

        width:100%;
    }
}

          .document-modal-header,
          .document-modal-actions {
            padding-left: 16px;
            padding-right: 16px;
          }

          .document-preview-frame {
            min-height: 300px;
          }
        }
      `}</style>
    </main>
  );
};

export default DocumentsMedicaux;
