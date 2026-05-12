import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Layout from "./Layout";
import AIPhysicsLab from "./AIPhysicsLab";
import VirtualLabList from "./VirtualLabList";
import OhmsLawLab from "./OhmsLawLab";
import CoulombsLawLab from "./CoulombsLawLab";
import ElectricFieldSandboxLab from "./ElectricFieldSandboxLab";
import ElectricPotentialLab from "./ElectricPotentialLab";
import CapacitanceLab from "./CapacitanceLab";
import SeriesParallelLab from "./SeriesParallelLab";
import AIChatAssistant from "./AIChatAssistant";
import ResultsPage from "./ResultsPage";
import TheoryPage from "./TheoryPage";
import TasksPage from "./TasksPage";
import TheoryDetailPage from "./TheoryDetailPage";
import LoginPage from "./LoginPage";
import AdminUsersPage from "./AdminUsersPage";
import "./src/index.css";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, booting, isAdmin } = useAuth();

  if (booting) {
    return <div className="min-h-screen bg-[#0a0918]" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<AIPhysicsLab embedded />} />
          <Route path="theory" element={<TheoryPage />} />
          <Route path="theory/:theoryId" element={<TheoryDetailPage />} />
          <Route path="theory/:theoryId/tasks" element={<TasksPage />} />
          <Route path="labs" element={<VirtualLabList />} />
          <Route path="labs/ohms-law" element={<OhmsLawLab />} />
          <Route path="labs/coulombs-law" element={<CoulombsLawLab />} />
          <Route path="labs/electric-field" element={<ElectricFieldSandboxLab />} />
          <Route path="labs/electric-potential" element={<ElectricPotentialLab />} />
          <Route path="labs/capacitance" element={<CapacitanceLab />} />
          <Route path="labs/series-parallel" element={<SeriesParallelLab />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="ai" element={<AIChatAssistant />} />
          <Route path="admin/users" element={<ProtectedRoute adminOnly><AdminUsersPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
