// React Router components for navigation
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Authentication context provider
import { AuthProvider } from './auth/AuthContext';

// Page components
import Login from './pages/Login';
import DashboardRouter from './components/DashboardRouter.jsx';

// Global styles
import './App.css';

function App() {
  return (
    // AuthProvider must wrap entire app to provide authentication context
    <AuthProvider>
      {/* BrowserRouter enables client-side routing */}
      <BrowserRouter>
        <div className="App">
          {/* Routes defines all possible page routes */}
          <Routes>
            {/* Root path shows login page */}
            <Route path="/" element={<Login />} />
            
            {/* Explicit /login route (same as root) */}
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard route uses DashboardRouter to show role-specific dashboard */}
            {/* DashboardRouter will render StudentDashboard OR StaffAdminDashboard based on user role */}
            <Route path="/dashboard" element={<DashboardRouter />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;