import React from 'react';
import post_3 from '../../assets/img/post/post_3.png';
import post_2 from '../../assets/img/post/post_2.png';
import post_1 from '../../assets/img/post/post_1.png';
import blogvacinnation from '../../assets/img/blogvacinnation.jpg';
import télécharger2 from '../../assets/img/télécharger (2).jpeg';
const PublicationsMedecin = () => {
  const handlePostClick = () => {
    alert("Fonctionnalité d'ajout de publication à implémenter");
  };

  const handleReadMore = (title) => {
    alert(`Redirection vers l'article : ${title}`);
  };

  return (
    <main className="content publications-main">
      {/* Bloc Hero */}
      <section className="pub-shell">
        <div className="pub-head">
          <div>
            <h1>Mes Publications</h1>
          </div>
          <button className="btn-post" type="button" onClick={handlePostClick}>
            <i className="fa-regular fa-square-plus"></i> Post
          </button>
        </div>

        <article className="hero-post">
          <div className="hero-content">
            <span className="pub-tag">Revolution clinique</span>
            <h2>Application de planification des rendez-vous hospitaliers pour cliniques, hopitaux et medecins</h2>
            <p>
              Connectez et integrez toutes vos sources de rendez-vous: site web, mobile, reception et teleconsultation.
              Centralisez les files d'attente patients, automatisez les rappels et fluidifiez l'accueil en service.
            </p>
            <button className="hero-btn" type="button" onClick={() => handleReadMore("Application de planification")}>
              Continuer la lecture...
            </button>
          </div>
        </article>
      </section>

      {/* Mini-cards */}
      <section className="pub-shell mini-cards">
        <article className="mini-post">
          <div className="mini-copy">
            <div className="topic-line">
              <span className="chip-blue">Monde</span>
              <span className="chip-gold">En vedette</span>
            </div>
            <h3>Le meilleur de la technologie</h3>
            <p className="meta">12 nov 2024</p>
            <p>L'intelligence artificielle assiste le triage, la lecture d'imagerie et le suivi patient pour gagner du temps medical utile.</p>
            <a href="#" onClick={(e) => { e.preventDefault(); handleReadMore("Le meilleur de la technologie"); }}>Lire plus <i className="fa-solid fa-arrow-right"></i></a>
          </div>
          <div className="mini-visual" style={{ backgroundImage: "url('/assets/img/télécharger (11).jpg')" }}></div>
        </article>

        <article className="mini-post">
          <div className="mini-copy">
            <div className="topic-line">
              <span className="chip-pink">Innovation sante</span>
              <span className="chip-gold">En vedette</span>
            </div>
            <h3>Le meilleur de la technologie</h3>
            <p className="meta">12 nov 2024</p>
            <p>Analyse predicitve, surveillance continue et coordination de soins: trois usages qui changent deja la pratique clinique.</p>
            <a href="#" onClick={(e) => { e.preventDefault(); handleReadMore("Le meilleur de la technologie (2)"); }}>Lire plus <i className="fa-solid fa-arrow-right"></i></a>
          </div>
          <div className="mini-visual" style={{ backgroundImage: "url('/assets/img/télécharger (9).jpg')" }}></div>
        </article>
      </section>

      {/* Grille principale + Sidebar */}
      <section className="pub-shell pub-grid">
        <div className="main-list">
          <article className="feature-card">
            <img src={télécharger2} alt="Transport medical intelligent en ville" />
            <div className="topic-line">
              <span className="chip-blue">Monde</span>
              <span className="chip-gold">En vedette</span>
            </div>
            <h3>Le grand debat commence quand la regle se termine a gravite zero</h3>
            <p className="meta">12 nov 2024</p>
            <p>Comment les systemes intelligents de transport sanitaire et de logistique hospitaliere peuvent reduire les delais de prise en charge des urgences en zone urbaine.</p>
            <button className="read-btn" type="button" onClick={() => handleReadMore("Le grand debat")}>
              Lire plus <i className="fa-solid fa-arrow-right"></i>
            </button>
          </article>

          <article className="feature-card">
            <img src={blogvacinnation} alt="Interface de prise de rendez-vous medical" />
            <div className="topic-line">
              <span className="chip-blue">Monde</span>
              <span className="chip-gold">En vedette</span>
            </div>
            <h3>Suivi preventif: du rappel vaccinal a la maladie chronique</h3>
            <p className="meta">8 nov 2024</p>
            <p>Des workflows simples pour ne plus perdre les patients entre consultation, examens et vaccination. Une methode basee sur des rappels cibles et une priorisation clinique.</p>
            <button className="read-btn" type="button" onClick={() => handleReadMore("Suivi preventif")}>
              Lire plus <i className="fa-solid fa-arrow-right"></i>
            </button>
          </article>
        </div>

        {/* Sidebar droite */}
        <aside>
          <div className="sidebar-card">
            <h4>A propos</h4>
            <p>Ce tableau de publications medecin centralise vos contenus de prevention, de protocoles et d'education therapeutique. L'objectif est de rendre la communication clinique claire, utile et actionnable pour vos patients.</p>
          </div>

          <div className="sidebar-card">
            <h4>Articles recents</h4>
            <div className="recent-line">
              <img src="/assets/img/post/post_1.png" alt="vignette article" />
              <div>
                <strong>Design UI/UX medical pour fluidifier le parcours patient</strong>
                <p>15 decembre 2024</p>
              </div>
            </div>
            <div className="recent-line">
              <img src="/assets/img/post/post_2.png" alt="vignette article" />
              <div>
                <strong>Telesuivi des traitements: ce qui fonctionne en pratique</strong>
                <p>27 aout 2024</p>
              </div>
            </div>
            <div className="recent-line">
              <img src={post_3} alt="vignette article" />
              <div>
                <strong>Plus vous voyez vos indicateurs, plus vous anticipez</strong>
                <p>20 juillet 2024</p>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h4>Archives</h4>
            <ul className="archives">
              <li><a href="#" onClick={(e) => e.preventDefault()}>Mars 2025</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Fevrier 2025</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Janvier 2025</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Decembre 2024</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Novembre 2024</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Octobre 2024</a></li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h4>Ailleurs</h4>
            <ul className="externals">
              <li><a href="#" onClick={(e) => e.preventDefault()}>GitHub</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Twitter</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Facebook</a></li>
            </ul>
          </div>
        </aside>
      </section>

      {/* Publications à fort impact */}
      <section className="pub-shell trend-wrap">
        <h2>Publications medicales a fort impact</h2>
        <p>Des sujets utiles pour la pratique clinique quotidienne et la prevention.</p>
        <div className="trend-grid">
          <article className="trend-card" style={{ backgroundImage: "url('/assets/img/blog/single_blog_1.png')" }}>
            <span className="trend-badge trend-badge-red">Urgences</span>
            <h3>Triage intelligent aux urgences: reduire l attente sans perdre la qualite</h3>
            <p>Protocoles de priorisation, alertes automatiques et orientation rapide selon la gravite.</p>
            <button className="read-btn" type="button" onClick={() => handleReadMore("Triage intelligent")}>Lire plus <i className="fa-solid fa-arrow-right"></i></button>
          </article>

          <article className="trend-card" style={{ backgroundImage: "url('/assets/img/blog/single_blog_2.png')" }}>
            <span className="trend-badge trend-badge-green">Telemedecine</span>
            <h3>Teleconsultation post-hospitalisation: securiser les 30 premiers jours</h3>
            <p>Check-lists cliniques, rappels therapeutiques et signaux d alerte a distance.</p>
            <button className="read-btn" type="button" onClick={() => handleReadMore("Teleconsultation")}>Lire plus <i className="fa-solid fa-arrow-right"></i></button>
          </article>

          <article className="trend-card" style={{ backgroundImage: "url('/assets/img/blog/single_blog_3.png')" }}>
            <span className="trend-badge trend-badge-orange">Prevention</span>
            <h3>Couverture vaccinale des adultes: strategie simple pour le cabinet</h3>
            <p>Segmenter les profils a risque, programmer les rappels et ameliorer l adherence.</p>
            <button className="read-btn" type="button" onClick={() => handleReadMore("Couverture vaccinale")}>Lire plus <i className="fa-solid fa-arrow-right"></i></button>
          </article>
        </div>
      </section>

      {/* Bouton flottant retour en haut (optionnel) */}
      <div className="floating-actions">
        <button type="button" aria-label="Monter" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      </div>
    </main>
  );
};

export default PublicationsMedecin;