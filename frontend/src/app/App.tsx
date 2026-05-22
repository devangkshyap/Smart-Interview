import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import InterviewConfiguration from './components/InterviewConfiguration';
import ActiveInterview from './components/ActiveInterview';
import ResumeAnalysis from './components/ResumeAnalysis';
import RegisterPage from './components/RegisterPage';
import ResultsSummary from './components/ResultsSummary';
import History from './components/History';
import ProfilePage from './components/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/configure" element={<InterviewConfiguration />} />
            <Route path="/interview/:id" element={<ActiveInterview />} />
            <Route path="/results/:id" element={<ResultsSummary />} />
            <Route path="/resume-analysis" element={<ResumeAnalysis />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
