import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import OAuthCallback from "./pages/OAuthCallback";
import RoleSelection from "./pages/RoleSelection";
import ImprovementPlanBoard from "./components/ImprovementPlanBoard";
import CertificateVerification from "./components/CertificateVerification";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import LanguageTool from "./components/LanguageTool";
import OpportunityDetail from "./components/OpportunityDetail";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  // If user has generic role 'user' and is not already on role selection page
  if (user.role === 'user' && location.pathname !== '/role-selection') {
    return <Navigate to="/role-selection" />;
  }

  // If user has specific role and tries to go to role selection
  if (user.role !== 'user' && location.pathname === '/role-selection') {
    return <Navigate to="/dashboard" />;
  }

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
            path="/role-selection" 
            element={
              <ProtectedRoute>
                <RoleSelection />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
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
          <Route
            path="/opportunities/:id"
            element={
              <ProtectedRoute>
                <OpportunityDetail />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
