import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/common/Layout";
import AIPhysicsLab from "./pages/labs/AIPhysicsLab";
import VirtualLabList from "./pages/labs/VirtualLabList";
import OhmsLawLab from "./labs/OhmsLawLab";
import CoulombsLawLab from "./labs/CoulombsLawLab";
import ElectricFieldSandboxLab from "./labs/ElectricFieldSandboxLab";
import ElectricPotentialLab from "./labs/ElectricPotentialLab";
import CapacitanceLab from "./labs/CapacitanceLab";
import SeriesParallelLab from "./labs/SeriesParallelLab";
import AIChatAssistant from "./pages/ai/AIChatAssistant";
import ResultsPage from "./pages/labs/ResultsPage";
import TheoryPage from "./pages/theory/TheoryPage";
import TasksPage from "./pages/tasks/TasksPage";
import TaskSolvePage from "./pages/tasks/TaskSolvePage";
import TheoryDetailPage from "./pages/theory/TheoryDetailPage";
import LoginPage from "./pages/auth/LoginPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import TeacherStatsPage from "./pages/teacher/TeacherStatsPage";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, booting, isAdmin } = useAuth();

  if (booting) {
    return <div className="min-h-screen bg-[#f4f1ff]" />;
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
          <Route path="tasks/:taskCode" element={<TaskSolvePage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="teacher" element={<TeacherStatsPage />} />
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
