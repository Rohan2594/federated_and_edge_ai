import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "./components/layout/Navbar";
import { Sidebar } from "./components/layout/Sidebar";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import CMAPSSPage from "./pages/CMAPSSPage";
import COCOPage from "./pages/COCOPage";
import ClientsPage from "./pages/ClientsPage";
import SecurityPage from "./pages/SecurityPage";
import CommunicationPage from "./pages/CommunicationPage";
import ResultsPage from "./pages/ResultsPage";
import ArchitecturePage from "./pages/ArchitecturePage";
import AboutPage from "./pages/AboutPage";

function PageWrapper({ children }) {
  return (
    <AnimatePresence mode="wait">
      {children}
    </AnimatePresence>
  );
}

export default function App() {
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-cyber-900 font-sans">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {!isLanding && (
        <Sidebar open={sidebarOpen} />
      )}

      <main
        className={
          isLanding
            ? "pt-14"
            : `pt-14 transition-all duration-300 ${sidebarOpen ? "lg:pl-60" : ""}`
        }
      >
        <div className={isLanding ? "" : "p-6 max-w-7xl mx-auto"}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cmapss" element={<CMAPSSPage />} />
            <Route path="/coco" element={<COCOPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/communication" element={<CommunicationPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
