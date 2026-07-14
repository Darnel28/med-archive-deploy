import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/css/bootstrap.min.css'
import './assets/css/owl.carousel.min.css'
import './assets/css/slicknav.css'
import './assets/css/flaticon.css'
import './assets/css/gijgo.css'
import './assets/css/animate.min.css'
import './assets/css/animated-headline.css'
import './assets/css/magnific-popup.css'
import './assets/css/fontawesome-all.min.css'
import './assets/css/themify-icons.css'
import './assets/css/slick.css'
import './assets/css/nice-select.css'
import './assets/css/style.css'
import './assets/css/styles.css'
import './assets/css/custom.css'
import './assets/css/DashAccueil.css'
import './index.css'
import './assets/css/Examen.css'
import App from './App.tsx'
import './assets/css/load.css'
import './assets/css/chart.css'
import './assets/css/global-modals.css'
import './assets/css/dashboard-responsive.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import "tailwindcss";

// QR codes use a hash URL so a static host can always return index.html. Convert
// it before BrowserRouter starts so the existing route /urgence/:imu is used.
const hashRoute = window.location.hash.match(/^#(\/urgence\/[^/?#]+)$/);
if (hashRoute) {
  window.history.replaceState(null, '', hashRoute[1]);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
