import React from 'react';

const ProfilMedecin = () => {
  // Données du profil (à remplacer plus tard par un appel API)
  const doctor = {
    name: "Dr. Jean Dupont",
    title: "Médecin Généraliste",
    location: "Cotonou, Bénin",
    experience: "12 ans d’expérience",
    registered: "Inscrit en 2023",
    avatar: "https://via.placeholder.com/90",
    email: "jean.dupont@medarchive.com",
    phone: "+229 90 00 00 00",
    hospital: "Centre Médical Cotonou",
    about: "Médecin généraliste expérimenté spécialisé dans la prise en charge des patients, le diagnostic rapide et le suivi médical. Utilise les outils numériques pour améliorer la qualité des soins et la coordination entre établissements.",
    skills: ["Diagnostic médical", "Urgences", "Suivi patient", "Prescriptions", "Analyse clinique", "Télémédecine"],
    stats: { patients: 540, consultations: 2130, rating: 4.9, team: 8 },
    work: {
      department: "Médecine Générale",
      service: "Consultation Externe",
      supervisor: "Dr. Paul Kossi",
      location: "Hôpital Central de Cotonou",
      contract: "Temps plein",
      hours: "08h00 - 16h00",
      workDays: "Lundi - Vendredi",
      timezone: "GMT+1 (Bénin)"
    },
    recentActivity: [
      { title: "Consultation - Paludisme", date: "Aujourd’hui, 09:30" },
      { title: "Prescription analyse sanguine", date: "Hier, 14:20" },
      { title: "Suivi patient diabétique", date: "Lundi, 11:00" }
    ],
    recentPatients: [
      { name: "Patient Koffi", status: "Traité", badgeClass: "green" },
      { name: "Patient Amina", status: "En cours", badgeClass: "blue" },
      { name: "Patient Serge", status: "En attente", badgeClass: "orange" }
    ]
  };

  const handleEdit = () => {
    alert("Modification du profil à implémenter");
  };

  const handleShare = () => {
    alert("Partager le profil");
  };

  return (
    <main className="content page-tight" style={{ background: '#f5f7fb' }}>
      {/* HEADER */}
      <div className="profile-header" style={{
        background: 'white',
        margin: '20px',
        padding: '25px',
        borderRadius: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={doctor.avatar} alt="Dr" style={{ width: '90px', height: '90px', borderRadius: '50%', marginRight: '20px' }} />
          <div>
            <h2 style={{ margin: 0 }}>{doctor.name}</h2>
            <p style={{ margin: '5px 0', color: 'gray' }}>{doctor.title}</p>
            <p style={{ margin: 0, color: 'gray' }}>{doctor.location} • {doctor.experience} • {doctor.registered}</p>
          </div>
        </div>
        <div>
          <button onClick={handleEdit} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', marginLeft: '10px', cursor: 'pointer', background: '#00b894', color: 'white' }}>Modifier</button>
          <button onClick={handleShare} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', marginLeft: '10px', cursor: 'pointer', background: '#ecf0f1' }}>Partager</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: '15px',
        margin: '20px'
      }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
          <strong>Patients suivis</strong>
          <p>{doctor.stats.patients}</p>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
          <strong>Consultations</strong>
          <p>{doctor.stats.consultations}</p>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
          <strong>Note moyenne</strong>
          <p>{doctor.stats.rating} ⭐</p>
        </div>
        <div style={{ background: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
          <strong>Équipe</strong>
          <p>{doctor.stats.team}</p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '20px',
        margin: '20px'
      }}>
        {/* LEFT COLUMN */}
        <div>
          {/* À propos */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
            <h3>À propos</h3>
            <p style={{ lineHeight: 1.6 }}>{doctor.about}</p>
            <div style={{ marginTop: '10px' }}>
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>Email : {doctor.email}</div>
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>Téléphone : {doctor.phone}</div>
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>Hôpital : {doctor.hospital}</div>
            </div>
          </div>

          {/* Compétences */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
            <h3>Compétences</h3>
            <div>
              {doctor.skills.map((skill, idx) => (
                <span key={idx} style={{ display: 'inline-block', padding: '8px 14px', margin: '5px', background: '#e6f7f5', borderRadius: '20px', fontSize: '13px' }}>{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Aperçu du travail */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
            <h3>Aperçu du travail</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Département</small>
                <strong>{doctor.work.department}</strong>
              </div>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Service</small>
                <strong>{doctor.work.service}</strong>
              </div>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Responsable</small>
                <strong>{doctor.work.supervisor}</strong>
              </div>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Lieu</small>
                <strong>{doctor.work.location}</strong>
              </div>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Type de contrat</small>
                <strong>{doctor.work.contract}</strong>
              </div>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Heures de travail</small>
                <strong>{doctor.work.hours}</strong>
              </div>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Jours de travail</small>
                <strong>{doctor.work.workDays}</strong>
              </div>
              <div style={{ background: '#f9fbfd', padding: '15px', borderRadius: '10px', border: '1px solid #eef2f7' }}>
                <small style={{ color: 'gray', display: 'block', marginBottom: '5px', fontSize: '12px' }}>Fuseau horaire</small>
                <strong>{doctor.work.timezone}</strong>
              </div>
            </div>
          </div>

          {/* Activité récente */}
          {/* <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
            <h3>Activité récente</h3>
            {doctor.recentActivity.map((item, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <strong style={{ display: 'block' }}>{item.title}</strong>
                <small style={{ color: 'gray' }}>{item.date}</small>
              </div>
            ))}
          </div> */}

          {/* Patients récents */}
          {/* <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)' }}>
            <h3>Patients récents</h3>
            {doctor.recentPatients.map((patient, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <span>{patient.name}</span>
                <span className={`badge ${patient.badgeClass}`} style={{
                  padding: '5px 10px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  background: patient.badgeClass === 'green' ? '#d4edda' : patient.badgeClass === 'blue' ? '#cce5ff' : '#ffeeba'
                }}>{patient.status}</span>
              </div>
            ))}
          </div> */}
        </div>
      </div>

      {/* Styles additionnels pour les badges (si non définis globalement) */}
      <style>{`
        .badge.green { background: #d4edda; }
        .badge.blue { background: #cce5ff; }
        .badge.orange { background: #ffeeba; }
      `}</style>
    </main>
  );
};

export default ProfilMedecin;