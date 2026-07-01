import blogVaccinationImage from "../assets/img/blogvacinnation.jpg";
import homeBilanImage from "../assets/img/télécharger (10).jpg";
import homeOperationImage from "../assets/img/blogimage.png";
import blogDetailImage1 from "../assets/img/télécharger.jpeg";
import blogDetailImage2 from "../assets/img/telecharger12.jpeg";
import blogDetailImage3 from "../assets/img/telecharger13.jpeg";
import blogDetailImage4 from "../assets/img/telecharger14.jpeg";

export const blogPosts = [
    {
        slug: "rappel-vaccins-carnet-numerique",
        category: "Santé",
        date: "Nov 30, 2026",
        day: "30",
        month: "Nov",
        image: blogVaccinationImage,
        recentImage: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=300&q=80",
        title: "Rappel des vaccins sur votre carnet numérique",
        excerpt:
            "Recevez des rappels utiles pour suivre les doses recommandées et garder votre historique vaccinal complet.",
        intro:
            "Un carnet numérique permet de centraliser les vaccins reçus, d'éviter les oublis et de suivre facilement les prochains rappels.",
        paragraphs: [
            "Chaque dose est enregistrée dans un espace sécurisé, ce qui simplifie les contrôles lors des consultations ou des voyages.",
            "MedArchive vous aide à conserver un historique fiable pour les enfants comme pour les adultes, avec des informations accessibles à tout moment.",
        ],
        quote:
            "Un suivi vaccinal clair réduit les oublis et facilite la prévention au quotidien.",
        conclusion:
            "Avec un rappel automatique et un accès rapide, la vaccination devient plus simple à suivre pour toute la famille.",
    },
    {
        slug: "constantes-vitales-archivage-immediat",
        category: "Bilan",
        date: "Nov 30, 2026",
        day: "30",
        month: "Nov",
        image: homeBilanImage,
        recentImage: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=300&q=80",
        title: "Archivage immédiat de vos constantes vitales",
        excerpt:
            "Gardez une trace claire de votre tension, pouls et température pour mieux suivre votre état de santé.",
        intro:
            "Les constantes vitales sont un repère essentiel pour comprendre l'évolution de votre santé et détecter plus vite une anomalie.",
        paragraphs: [
            "En enregistrant les mesures dès leur prise, vous évitez les pertes d'information et gardez un historique exploitable par les soignants.",
            "Cette organisation facilite aussi les bilans réguliers et permet d'identifier les tendances importantes avant qu'elles ne deviennent critiques.",
        ],
        quote:
            "Des mesures archivées au bon moment donnent une meilleure lecture du suivi médical.",
        conclusion:
            "MedArchive rend ces données disponibles immédiatement pour un suivi plus précis et plus réactif.",
    },
    {
        slug: "prise-en-charge-rapide",
        category: "Opération",
        date: "Nov 30, 2026",
        day: "30",
        month: "Nov",
        image: homeOperationImage,
        recentImage: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=300&q=80",
        title: "Prise en charge rapide et coordonnée",
        excerpt:
            "Une meilleure circulation de l'information permet aux professionnels de réagir plus vite en situation urgente.",
        intro:
            "Lorsqu'un patient a besoin d'une prise en charge rapide, l'accès aux bons documents fait gagner un temps précieux.",
        paragraphs: [
            "Le dossier numérique rassemble les informations utiles, ce qui permet aux équipes de soins de décider plus vite et plus sereinement.",
            "La coordination entre services devient plus fluide, avec moins de doublons et plus de continuité dans le traitement.",
        ],
        quote:
            "La rapidité de prise en charge dépend souvent de la qualité des informations accessibles.",
        conclusion:
            "Un dossier bien structuré renforce la sécurité du patient à chaque étape du parcours de soins.",
    },
    {
        slug: "respiration-et-surveillance-hospitaliere",
        category: "Urgence",
        date: "15 Jan 2026",
        day: "15",
        month: "Jan",
        image: blogDetailImage1,
        recentImage: "https://images.unsplash.com/photo-1580281657527-47f249e8f3b0?auto=format&fit=crop&w=300&q=80",
        title: "Comprendre la surveillance respiratoire à l'hôpital",
        excerpt:
            "Repérer les bons signaux et dialoguer avec l'équipe soignante permet de mieux accompagner un proche hospitalisé.",
        intro:
            "La surveillance respiratoire demande une attention continue et une communication simple entre le patient, la famille et les soignants.",
        paragraphs: [
            "L'objectif est de détecter rapidement les signes d'amélioration ou d'alerte afin d'ajuster la prise en charge.",
            "Un dossier médical partagé aide à garder la même information partout, ce qui évite les pertes de repères pendant l'hospitalisation.",
        ],
        quote:
            "Un suivi précis rassure les proches et soutient les décisions médicales.",
        conclusion:
            "Plus les informations sont claires, plus la surveillance devient simple à coordonner.",
    },
    {
        slug: "consultation-medicale-preparation",
        category: "Prévention",
        date: "15 Jan 2026",
        day: "15",
        month: "Jan",
        image: blogDetailImage2,
        title: "Bien préparer sa consultation médicale",
        excerpt:
            "Préparer ses documents et ses questions permet de profiter pleinement du temps passé avec le médecin.",
        intro:
            "Une consultation efficace commence souvent avant le rendez-vous, avec une bonne organisation des informations utiles.",
        paragraphs: [
            "Rassembler les examens récents, les ordonnances et les symptômes observés aide le professionnel à mieux comprendre la situation.",
            "Cette préparation améliore la qualité du dialogue et réduit le risque d'oublier un détail important.",
        ],
        quote:
            "Un rendez-vous bien préparé donne souvent une réponse médicale plus précise.",
        conclusion:
            "MedArchive simplifie cette préparation en regroupant les documents à un seul endroit.",
    },
    {
        slug: "tension-arterielle-suivi-domicile",
        category: "Suivi médical",
        date: "15 Jan 2026",
        day: "15",
        month: "Jan",
        image: blogDetailImage3,
        title: "Prise de tension : quand et comment la contrôler",
        excerpt:
            "Mesurer correctement sa tension à domicile aide à mieux prévenir les risques cardiovasculaires.",
        intro:
            "Le contrôle de la tension doit rester régulier, calme et consigné dans un suivi lisible par le patient et le médecin.",
        paragraphs: [
            "En notant les mesures au même moment de la journée, vous obtenez des tendances plus fiables pour votre bilan.",
            "Le suivi numérique évite de multiplier les carnets papier et rassemble les résultats de manière cohérente.",
        ],
        quote:
            "Une mesure régulière vaut mieux qu'une estimation approximative.",
        conclusion:
            "Ce suivi est encore plus utile quand les données sont archivées et partageables en un clic.",
    },
    {
        slug: "alimentation-preventive-quotidienne",
        category: "Nutrition",
        date: "15 Jan 2026",
        day: "15",
        month: "Jan",
        image: blogDetailImage4,
        title: "Fruits et légumes : base d'une alimentation préventive",
        excerpt:
            "Miser sur des repas simples et équilibrés renforce l'immunité et aide à prévenir les maladies chroniques.",
        intro:
            "L'alimentation préventive repose sur des choix réguliers, variés et faciles à maintenir dans la durée.",
        paragraphs: [
            "Les fruits et légumes apportent des fibres, des vitamines et des repères utiles pour construire des repas plus sains.",
            "Suivre ses habitudes dans un espace numérique permet aussi de mieux relier nutrition, activité physique et santé générale.",
        ],
        quote:
            "Une bonne prévention commence dans l'assiette, puis se prolonge dans le suivi médical.",
        conclusion:
            "Avec de petites habitudes constantes, la prévention devient plus naturelle au quotidien.",
    },
    {
        slug: "partage-dossier-medecin-securise",
        category: "Innovation",
        date: "12 Fév 2026",
        day: "12",
        month: "Fév",
        image: blogDetailImage2,
        title: "Bien partager son dossier avec son médecin",
        excerpt:
            "Le partage ciblé des documents médicaux améliore la qualité des échanges sans compromettre la confidentialité.",
        intro:
            "Partager un dossier ne veut pas dire tout exposer. Il faut sélectionner les bons éléments et garder le contrôle des accès.",
        paragraphs: [
            "Un système centralisé comme MedArchive aide à décider quel professionnel peut consulter quelle information.",
            "Le patient garde une vision claire de ce qui est partagé, de ce qui est consulté et du moment où cela se produit.",
        ],
        quote:
            "Le bon partage, c'est celui qui sert le soin tout en respectant la confidentialité.",
        conclusion:
            "La sécurité n'empêche pas la fluidité, elle la rend plus fiable.",
    },
];

export function getBlogPostBySlug(slug) {
    return blogPosts.find((post) => post.slug === slug) ?? blogPosts[0];
}

export function getBlogPreviewPosts() {
    return blogPosts.slice(0, 3);
}

export function getBlogFrontPosts() {
    return blogPosts.slice(0, 5);
}

export function getBlogRelatedPosts(currentSlug, limit = 4) {
    return blogPosts.filter((post) => post.slug !== currentSlug).slice(0, limit);
}