import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Simulation from "./pages/Simulation";
import Demo from "./pages/Demo";

import Analytics from "./pages/Analytics";
import ModelDashboard from "./pages/ModelDashboard";
import { AquaLoopProvider } from "./hooks/useAquaLoopData";
import AlertToast from "./components/AlertToast";

function App() {
  return (
    <Router>
      <AquaLoopProvider>
        <div className="w-full bg-background min-h-screen flex flex-col">
          <Navbar />
          <AlertToast />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/model" element={<ModelDashboard />} />
              <Route path="/Demo" element={<Demo />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AquaLoopProvider>
    </Router>
  );
}

export default App;
