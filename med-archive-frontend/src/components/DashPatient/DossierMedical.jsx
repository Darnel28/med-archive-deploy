import React from 'react';

const DocumentsMedicaux = () => {
  return (
    <main className="content page-tight">
      <section className="page-title-card">
        <h1>Documents médicaux</h1>
      </section>

      <section className="docsfm-storage">
        <div className="docsfm-storage-info">
          <span><strong>47,52 Go</strong> utilisées sur 119 Go</span>
          <div className="docsfm-storage-track" aria-hidden="true">
            <span className="docsfm-storage-fill" style={{ width: '40%' }}></span>
          </div>
        </div>
        {/* <button className="btn transfer-add-btn">
          <i className="fa-regular fa-file-lines"></i> Importer des documents
        </button> */}
      </section>

      <section className="docsfm-layout">
        <div className="docsfm-main">
          <h2 className="docsfm-title">Dossiers</h2>
          <div className="docsfm-folder-grid">
            <article className="docsfm-folder-card">
              <div className="docsfm-folder-top">
                <input type="checkbox" aria-label="Sélectionner Scanner" />
                <button className="docsfm-more"><i className="fa-solid fa-ellipsis-vertical"></i></button>
              </div>
              <i className="fa-solid fa-folder docsfm-folder-icon"></i>
              <h3>Scanner</h3>
              <div className="docsfm-folder-meta">
                <span><strong>412</strong> fichiers</span>
                <span><strong>5.48</strong> Go</span>
              </div>
            </article>

            <article className="docsfm-folder-card">
              <div className="docsfm-folder-top">
                <input type="checkbox" aria-label="Sélectionner Radios" />
                <button className="docsfm-more"><i className="fa-solid fa-ellipsis-vertical"></i></button>
              </div>
              <i className="fa-solid fa-folder docsfm-folder-icon"></i>
              <h3>Radios</h3>
              <div className="docsfm-folder-meta">
                <span><strong>380</strong> fichiers</span>
                <span><strong>4.75</strong> Go</span>
              </div>
            </article>

            <article className="docsfm-folder-card">
              <div className="docsfm-folder-top">
                <input type="checkbox" aria-label="Sélectionner IRM" />
                <button className="docsfm-more"><i className="fa-solid fa-ellipsis-vertical"></i></button>
              </div>
              <i className="fa-solid fa-folder docsfm-folder-icon"></i>
              <h3>IRM</h3>
              <div className="docsfm-folder-meta">
                <span><strong>150</strong> fichiers</span>
                <span><strong>2.69</strong> Go</span>
              </div>
            </article>

            <article className="docsfm-folder-card">
              <div className="docsfm-folder-top">
                <input type="checkbox" aria-label="Sélectionner Echographies" />
                <button className="docsfm-more"><i className="fa-solid fa-ellipsis-vertical"></i></button>
              </div>
              <i className="fa-solid fa-folder docsfm-folder-icon"></i>
              <h3>Echographies</h3>
              <div className="docsfm-folder-meta">
                <span><strong>105</strong> fichiers</span>
                <span><strong>1.44</strong> Go</span>
              </div>
            </article>
          </div>

          <h2 className="docsfm-title" style={{ marginTop: '24px' }}>Fichiers récents</h2>
          <article className="rdv-card docsfm-table-card">
            <div className="rdv-table-wrap">
              <table className="rdv-table docsfm-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Élément</th>
                    <th>Taille</th>
                    <th>Date récente</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="docsfm-file-name"><i className="fa-regular fa-image"></i> radios_poumon.jpg</td>
                    <td>01</td>
                    <td>2.4 MB</td>
                    <td>24 Mai, 2022</td>
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action"><i className="fa-solid fa-star"></i></button>
                      <button className="icon-action"><i className="fa-solid fa-ellipsis"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="docsfm-file-name"><i className="fa-regular fa-file-pdf"></i> scanner_cerebral.pdf</td>
                    <td>01</td>
                    <td>3.6 MB</td>
                    <td>18 Mai, 2022</td>
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action"><i className="fa-regular fa-star"></i></button>
                      <button className="icon-action"><i className="fa-solid fa-ellipsis"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="docsfm-file-name"><i className="fa-regular fa-file-pdf"></i> echographie_abdom.pdf</td>
                    <td>01</td>
                    <td>2.1 MB</td>
                    <td>15 Mai, 2022</td>
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action"><i className="fa-regular fa-star"></i></button>
                      <button className="icon-action"><i className="fa-solid fa-ellipsis"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="docsfm-file-name"><i className="fa-regular fa-file-lines"></i> irm_genou.img</td>
                    <td>01</td>
                    <td>5.4 MB</td>
                    <td>06 Mai, 2022</td>
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action"><i className="fa-solid fa-star"></i></button>
                      <button className="icon-action"><i className="fa-solid fa-ellipsis"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="docsfm-file-name"><i className="fa-regular fa-file-pdf"></i> compte_rendu_hopital.pdf</td>
                    <td>01</td>
                    <td>1.1 MB</td>
                    <td>30 Avr, 2022</td>
                    <td className="rdv-actions table-actions-compact">
                      <button className="icon-action"><i className="fa-regular fa-star"></i></button>
                      <button className="icon-action"><i className="fa-solid fa-ellipsis"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <aside className="docsfm-side">
          <div className="docsfm-side-head">
            <h3>Vue d'ensemble</h3>
            <button className="icon-action" title="Fermer"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="docsfm-donut" aria-hidden="true"></div>
          <ul className="docsfm-legend">
            <li><span className="dot scanner"></span> Scanner <strong>5.48 Go</strong></li>
            <li><span className="dot radios"></span> Radios <strong>4.75 Go</strong></li>
            <li><span className="dot irm"></span> IRM <strong>2.69 Go</strong></li>
            <li><span className="dot echo"></span> Echographies <strong>1.44 Go</strong></li>
            <li><span className="dot autres"></span> Autres <strong>7.56 Go</strong></li>
          </ul>

          <div className="docsfm-mini-list">
            <article>
              <i className="fa-regular fa-folder"></i>
              <div>
                <h4>Scanner</h4>
                <span>412 fichiers</span>
              </div>
              <strong>5.48 Go</strong>
            </article>
            <article>
              <i className="fa-regular fa-folder"></i>
              <div>
                <h4>Radios</h4>
                <span>380 fichiers</span>
              </div>
              <strong>4.75 Go</strong>
            </article>
            <article>
              <i className="fa-regular fa-folder"></i>
              <div>
                <h4>IRM</h4>
                <span>150 fichiers</span>
              </div>
              <strong>2.69 Go</strong>
            </article>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default DocumentsMedicaux;