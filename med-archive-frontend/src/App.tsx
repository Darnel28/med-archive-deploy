import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import AllRoutes from "./AllRoutes.jsx";
import Footer from "./components/Footer.jsx";
import Load from "./components/load.jsx";

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // Loader on initial page load
  useEffect(() => {
    const finishLoading = () => setTimeout(() => setIsLoading(false), 700);

    if (document.readyState === "complete") {
      finishLoading();
      return;
    }

    window.addEventListener("load", finishLoading, { once: true });

    return () => window.removeEventListener("load", finishLoading);
  }, []);

  // Loader on route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 500);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "#ffffff",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Load />
      </div>
    );
  }

  const currentPath = location.pathname;
  const isDashboardRoute = currentPath.startsWith("/espacepatient") || currentPath.startsWith("/DasbordPatient") ||
    currentPath.startsWith("/espacemedecin") || currentPath.startsWith("/espaceaccueil") || currentPath.startsWith("/espaceexamen") || currentPath.startsWith("/espacehopital");


  if (isDashboardRoute) {
    return <AllRoutes />;
  }

  return (
    <>
      <Header />
      <main>
        <AllRoutes />
      </main>
      <Footer />
    </>
  );
}

export default App;
