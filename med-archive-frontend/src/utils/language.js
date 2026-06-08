const translations = {
  'Mes consultations': 'My consultations',
  'Mes rendez-vous': 'My appointments',
  'Fiche de consultation médicale': 'Medical consultation form',
  'Informations du patient': 'Patient information',
  'Nom et prénom': 'Full name',
  'Sexe': 'Gender',
  'Date de naissance / âge': 'Date of birth / age',
  'Numéro de dossier médical': 'Medical record number',
  'Informations sur la consultation': 'Consultation information',
  'Date de la consultation': 'Consultation date',
  'Heure': 'Time',
  'Médecin responsable': 'Attending physician',
  'Hôpital / établissement': 'Hospital / facility',
  'Type de consultation': 'Consultation type',
  'Nouvelle consultation': 'New consultation',
  'Suivi': 'Follow-up',
  'Urgence': 'Emergency',
  'Prochain RDV': 'Next appointment',
  'Motif de consultation': 'Reason for consultation',
  'Détails du motif': 'Reason details',
  'Symptômes et observations': 'Symptoms and observations',
  'Tension artérielle': 'Blood pressure',
  'Température': 'Temperature',
  'Autres observations': 'Other observations',
  'Diagnostic': 'Diagnosis',
  'Conclusion médicale': 'Medical conclusion',
  'Prescription (ordonnance)': 'Prescription',
  'Nom du médicament': 'Medication',
  'Dosage': 'Dosage',
  'Durée du traitement': 'Treatment duration',
  'Fréquence': 'Frequency',
  'Examens demandés (si nécessaire)': 'Requested tests (if needed)',
  'Analyse de sang': 'Blood test',
  'Radiographie': 'X-ray',
  'Test laboratoire': 'Laboratory test',
  'Notes médicales': 'Medical notes',
  'Commentaires du médecin': "Physician's comments",
  'Valider': 'Save',
  'Enregistrer': 'Save',
  'Enregistrer la consultation': 'Save consultation',
  'Ajouter un rendez-vous': 'Add appointment',
  'Programmer un rendez-vous': 'Schedule an appointment',
  'Annuler': 'Cancel',
  'Patient': 'Patient',
  'Motif': 'Reason',
  'Statut': 'Status',
  'Action': 'Action',
  'Commencer': 'Start',
  'Terminer': 'Finish',
  'En attente': 'Pending',
  'En cours': 'In progress',
  'Terminée': 'Completed',
  'Absent': 'Absent',
  'Notifications': 'Notifications',
  'Navigation': 'Navigation',
  'Gestion du compte': 'Account management',
  'Tableau de bord': 'Dashboard',
  'Mes patients': 'My patients',
  'Examens': 'Tests',
  'Publications': 'Publications',
  'Profil': 'Profile',
  'Paramètres': 'Settings',
  'Se déconnecter': 'Sign out',
  "Besoin d'aide ?": 'Need help?',
  'Dossier médical numérique': 'Digital medical record',
  'Commencez un rendez-vous pour ouvrir et préremplir sa fiche de consultation.': 'Start an appointment to open and prefill its consultation form.',
  'Déconnexion': 'Sign out',
  'Ouvrir le menu': 'Open menu',
  'Changer la langue': 'Change language',
  'Mode nuit': 'Dark mode',
  'Messages': 'Messages',
  'Ouvrir les notifications': 'Open notifications',
};

const reverseTranslations = Object.fromEntries(Object.entries(translations).map(([fr, en]) => [en, fr]));

function translateValue(value, language) {
  const dictionary = language === 'en' ? translations : reverseTranslations;
  const trimmed = value.trim();
  const numbered = trimmed.match(/^(\d+\.\s*)(.+)$/);
  const prefix = numbered?.[1] || '';
  const key = numbered?.[2] || trimmed;
  const translated = dictionary[key];
  return translated ? value.replace(trimmed, `${prefix}${translated}`) : value;
}

export function applyLanguage(language) {
  document.documentElement.lang = language;
  const root = document.querySelector('.app') || document.body;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (node.parentElement?.closest('script, style')) return;
    node.nodeValue = translateValue(node.nodeValue, language);
  });
  root.querySelectorAll('[placeholder], [title], [aria-label]').forEach((element) => {
    ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
      if (element.hasAttribute(attribute)) element.setAttribute(attribute, translateValue(element.getAttribute(attribute), language));
    });
  });
}
