import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import AllRoutes from "./AllRoutes.jsx";
import Footer from "./components/Footer.jsx";
import Load from "./components/load.jsx";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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
    const handlePopState = () => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        setCurrentPath(newPath);
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentPath]);

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

  const isDashPatientRoute = currentPath.startsWith("/espacepatient") || currentPath.startsWith("/DasbordPatient") ||
    currentPath.startsWith("/espacemedecin") || currentPath.startsWith("/espaceaccueil") || currentPath.startsWith("/espaceexamen") || currentPath.startsWith("/espacehopital") || currentPath.startsWith("/connexion");;


  if (isDashPatientRoute) {
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