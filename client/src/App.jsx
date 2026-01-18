import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// import Dashboard from './pages/Dashboard'; // Replaced
import JobDashboard from './pages/JobDashboard';
import JobDetailsPage from './pages/JobDetailsPage';
import PracticeQuestionPage from './pages/PracticeQuestionPage';
import Interview from './pages/Interview';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import Analysis from './pages/Analysis';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>

          {/* Routes wrapped in Main Layout (Nav Bar) */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<JobDashboard />} />
            <Route path="/job/:id" element={<JobDetailsPage />} />
            <Route path="/practice/:jobId/:questionId" element={<PracticeQuestionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/analysis/:id" element={<Analysis />} />
          </Route>

          {/* Routes without Layout (Full Screen) */}
          <Route path="/interview/:id" element={<Interview />} />
          <Route path="/interview/new" element={<Navigate to="/dashboard" replace />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
