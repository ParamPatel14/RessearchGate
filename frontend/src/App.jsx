import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OAuthCallback from "./pages/OAuthCallback";
import ImprovementPlanBoard from "./components/ImprovementPlanBoard";
import CertificateVerification from "./components/CertificateVerification";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import LanguageTool from "./components/LanguageTool";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth" element={<OAuthCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/improvement-plans"
            element={
              <ProtectedRoute>
                <ImprovementPlanBoard />
              </ProtectedRoute>
            }
          />
          {/* Phase 7 Routes */}
          <Route path="/verify-certificate/:uuid" element={<CertificateVerification />} />
          <Route path="/verify-certificate" element={<CertificateVerification />} />
          
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tools"
            element={
              <ProtectedRoute>
                <LanguageTool />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
