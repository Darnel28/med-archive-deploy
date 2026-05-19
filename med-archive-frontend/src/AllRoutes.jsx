import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import Testimonial from "./components/Testimonial.jsx";
import Blog from "./components/Blog.jsx";
import APropos from "./components/APropos.jsx";
import BlogFront from "./components/BlogFront.jsx";
import BlogDetail from "./components/BlogDetail.jsx";
import Contact from "./components/Contact.jsx";
import DashPatient from "./components/DashPatient/index.jsx";
import DashboardHome from "./components/DashPatient/DashboardHome.jsx";
import DashMedecin from "./components/DashMedecin/index.jsx";
import DashAccueil from "./components/DashAccueil/index.jsx";
import DashExamen from "./components/DashExamen/index.jsx";
import DashHopital from "./components/DashHopital/index.jsx";

// Dashboard sub-pages
import ConsultationsHistory from "./components/DashPatient/Historiqueconsultation.jsx";
import ResultatsAnalyses from "./components/DashPatient/resultat-analyse.jsx";
import Ordonnances from "./components/DashPatient/ordonnance.jsx";
import DocumentsMedicaux from "./components/DashPatient/DossierMedical.jsx";
import Traitements from "./components/DashPatient/traitement.jsx";
import AccesDonnees from "./components/DashPatient/access-donnes.jsx";
import Notifications from "./components/DashPatient/notification.jsx";
import PreferencesNotifications from "./components/DashPatient/preferencenotification.jsx";
import SecuriteCompte from "./components/DashPatient/sécuritecompte.jsx";
import Profil from "./components/DashPatient/profil.jsx";
import Parametres from "./components/DashPatient/parametre.jsx";
import DossierMedical from "./components/DashPatient/DossierMedical.jsx";
import DossierMedicalDetails from "./components/DashPatient/DossierPatientComplet.jsx";
import RendezVousPatient from "./components/DashPatient/RendezVousPatient.jsx";
// DashboardMedecin 

import DashboardHomeMedecin from "./components/DashMedecin/DashboardHomeMedecin.jsx";
import RendezVousMedecin from './components/DashMedecin/Rendez-vous.jsx';
import MesPatientsMedecin from "./components/DashMedecin/PatientMedecin.jsx";
import ConsultationMedecin from "./components/DashMedecin/ConsultationMedecin.jsx";
import ExamensMedecin from "./components/DashMedecin/Examen.jsx";
import PublicationsMedecin from "./components/DashMedecin/Publication.jsx";
import NotificationsMedecin from "./components/DashMedecin/NotificationMedecin.jsx";
import ProfilMedecin from "./components/DashMedecin/ProfilMedecin.jsx";
import ParametresMedecin from "./components/DashMedecin/ParametresMedecin.jsx";
import PreferencesNotificationsMed from "./components/DashMedecin/PreferenceNotificationMed.jsx";
import SecuriteCompteMed from "./components/DashMedecin/SecuritecompteMed.jsx";
import DashboardHomeAccueil from "./components/DashAccueil/DashboardHomeAccueil.jsx";
import DashHomeHopital from "./components/DashHopital/DashHomeHopital.jsx";
// accueil
import PatientService from "./components/DashAccueil/PatientService.jsx";
import MedecinService from "./components/DashAccueil/MedecinService.jsx";
import TransfertService from "./components/DashAccueil/TransfertService.jsx";
import RendezVousService from "./components/DashAccueil/RendezVousService.jsx";
// Examens
import DashboardLabo from "./components/DashExamen/DashExamHome.jsx";
import DemandeExamLabo from "./components/DashExamen/DemandeExam.jsx";
import ResultatExamLabo from "./components/DashExamen/ResultatExam.jsx";
import AlertesExamen from "./components/DashExamen/Alertes.jsx";

// Hopital
import TransfertHopital from "./components/DashHopital/TransfertHopital.jsx";
import Rapports from "./components/DashHopital/Rapports.jsx";
import NotificationsHopital from "./components/DashHopital/NotificationHopital.jsx";

// Homepage component
const HomePage = () => (
    <>
        <Hero />
        <About />
        <Services />
        <Testimonial />
        <Blog />
    </>
);

function AllRoutes() {
    return (
        <Routes>
            {/* Public pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<APropos />} />
            <Route path="/blog" element={<BlogFront />} />
            <Route path="/blog-detail" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />

            {/* Dashboard with nested routes - DashPatient is the layout parent */}
            <Route path="/espacepatient" element={<DashPatient />}>
                <Route index element={<DashboardHome />} />
                <Route path="consultations" element={<ConsultationsHistory />} />
                <Route path="resultats-analyses" element={<ResultatsAnalyses />} />
                <Route path="ordonnances" element={<Ordonnances />} />
                <Route path="documents-medicaux" element={<DocumentsMedicaux />} />
                <Route path="traitements" element={<Traitements />} />
                <Route path="acces-donnees" element={<AccesDonnees />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profil" element={<Profil />} />
                <Route path="parametres" element={<Parametres />} />
                <Route path="dossier-medical" element={<DossierMedicalDetails />} />
                <Route path="preferences-notifications" element={<PreferencesNotifications />} />
                <Route path="securite-compte" element={<SecuriteCompte />} />
                <Route path="rendez-vous" element={<RendezVousPatient />} />

            </Route>

            {/* Alternative dashboard path */}
            <Route path="/DasbordPatient" element={<DashPatient />}>
                <Route index element={<DashboardHome />} />
                <Route path="consultations" element={<ConsultationsHistory />} />
                <Route path="resultats-analyses" element={<ResultatsAnalyses />} />
                <Route path="ordonnances" element={<Ordonnances />} />
                <Route path="documents-medicaux" element={<DocumentsMedicaux />} />
                <Route path="traitements" element={<Traitements />} />
                <Route path="acces-donnees" element={<AccesDonnees />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profil" element={<Profil />} />
                <Route path="parametres" element={<Parametres />} />
                <Route path="dossier-medical" element={<DossierMedicalDetails />} />
                <Route path="preferences-notifications" element={<PreferencesNotifications />} />
                <Route path="securite-compte" element={<SecuriteCompte />} />
            </Route>
            <Route path="/espacemedecin" element={<DashMedecin />}>
                <Route index element={<DashboardHomeMedecin />} />
                {/* Ajoute ici les autres routes propres au médecin */}
                <Route path="rendez-vous" element={<RendezVousMedecin />} />
                <Route path="patients" element={<MesPatientsMedecin />} />
                <Route path="consultations" element={<ConsultationMedecin />} />
                <Route path="examens" element={<ExamensMedecin />} />
                <Route path="publications" element={<PublicationsMedecin />} />
                <Route path="notifications" element={<NotificationsMedecin />} />
                <Route path="profil" element={<ProfilMedecin />} />
                <Route path="parametres" element={<ParametresMedecin />} />
                <Route path="preferences-notifications" element={<PreferencesNotificationsMed />} />
                <Route path="securite-compte" element={<SecuriteCompteMed />} />
            </Route>
            <Route path="/espaceaccueil" element={<DashAccueil />}>
                <Route index element={<DashboardHomeAccueil />} />
                <Route path="patients" element={<PatientService />} />
                <Route path="medecins" element={<MedecinService />} />
                <Route path="transfert" element={<TransfertService />} />
                <Route path="rendez-vous" element={<RendezVousService />} />
            </Route>
            <Route path="/espaceexamen" element={<DashExamen />} >
                <Route index element={<DashboardLabo />} />
                <Route path="demandes" element={<DemandeExamLabo />} />
                <Route path="resultats" element={<ResultatExamLabo />} />
                <Route path="alertes" element={<AlertesExamen />} />
                {/* Ajoute ici les autres routes propres au laboratoire */}
            </Route>
            <Route path="/espacehopital" element={<DashHopital />} >
                <Route index element={<DashHomeHopital />} />
                <Route path="transfert" element={<TransfertHopital />} />
                <Route path="rapports" element={<Rapports />} />.
                <Route path="notifications" element={<NotificationsHopital />} />
                {/* Ajoute ici les autres routes propres à l'hôpital */}
            </Route>

        </Routes>
    );
}

export default AllRoutes;