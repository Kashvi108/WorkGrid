import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react';

const LandingPage = lazy(()=> import ('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProjectsDashboard = lazy(() => import('./pages/ProjectsDashboard'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Employees = lazy(() => import('./pages/Employees'));

function App() {
  return (
    <BrowserRouter>
    <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsDashboard />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/employees" element={<Employees />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App