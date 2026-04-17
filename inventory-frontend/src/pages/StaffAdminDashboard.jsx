import { useAuth } from '../auth/AuthContext'; 
import { useNavigate } from 'react-router-dom'; 
import { useState, useEffect } from 'react'; 
import AssetManagement from '../components/AssetManagement'; // Equipment management component
import LoanRequests from '../components/LoanRequests'; // Loan requests component
import ActiveLoans from '../components/ActiveLoans'; // Active loans component
import Dashboard from '../components/Dashboard'; // Dashboard overview component
import UserManagement from '../components/UserManagement'; // User management component
import RecentActivity from '../components/RecentActivity'; // Activity log component

// Main dashboard component for staff/admin users
const StaffAdminDashboard = () => {
  const { user, logout } = useAuth(); // Get current user and logout function
  const [userDetails, setUserDetails] = useState(null); // Store user details from API
  const [loading, setLoading] = useState(true); // Loading state
  const [activeSection, setActiveSection] = useState('dashboard'); // Track active tab
  const navigate = useNavigate(); // Navigation hook

  // Fetch user details when component loads or user changes
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // API call to get user details
        const response = await fetch(`http://localhost:7028/api/Users/${user.userId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` } // Include auth token
        });

        if (response.ok) {
          const data = await response.json(); // Parse response
          setUserDetails(data); // Save user details
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error); // Log error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    // Only fetch if user ID exists
    if (user?.userId) {
      fetchUserDetails();
    }
  }, [user?.userId, user?.token]);

  // Handle logout button click
  const handleLogout = () => {
    logout(); // Clear auth state
    navigate('/login'); // Redirect to login page
  };

  const isAdmin = user?.role === 'Admin'; // Check if user is admin

  // Display user's full name if available, otherwise fallback to user ID
  const displayName = userDetails 
    ? `${userDetails.fname} ${userDetails.lname}` 
    : user?.userId;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header section */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0'
          }}>
            {/* Logo and title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'gray',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              </div>

              {/* App title */}
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  IT Equipment Management
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  University of Hull - {isAdmin ? 'Admin' : 'Staff'} Portal
                </p>
              </div>
            </div>

            {/* User info and logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                {/* Display name */}
                <p style={{ margin: 0, fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                  {loading ? 'Loading...' : displayName}
                </p>

                {/* Role label */}
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {isAdmin ? 'Admin' : 'Staff '}
                </p>
              </div>

              {/* Logout button */}
              <button onClick={handleLogout} style={{
                padding: '8px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {/* Logout icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Tab navigation */}
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px',
          display: 'inline-flex',
          gap: '4px',
          marginBottom: '32px'
        }}>
          
          {/* Dashboard tab */}
          <button
            onClick={() => setActiveSection('dashboard')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'dashboard' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'dashboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'dashboard' ? '600' : '500'
            }}
          >
            Dashboard
          </button>

          {/* Equipment tab */}
          <button
            onClick={() => setActiveSection('assets')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'assets' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'assets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'assets' ? '600' : '500'
            }}
          >
            Equipment
          </button>

          {/* Loan Requests tab (admin only) */}
          {isAdmin && (
            <button
              onClick={() => setActiveSection('loanRequests')}
              style={{
                ...tabButtonStyle,
                backgroundColor: activeSection === 'loanRequests' ? '#ffffff' : 'transparent'
              }}
            >
              Loan Requests
            </button>
          )}

          {/* Active Loans tab */}
          <button
            onClick={() => setActiveSection('activeLoans')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'activeLoans' ? '#ffffff' : 'transparent'
            }}
          >
            Active Loans
          </button>

          {/* Users tab (admin only) */}
          {isAdmin && (
            <button
              onClick={() => setActiveSection('users')}
              style={{
                ...tabButtonStyle,
                backgroundColor: activeSection === 'users' ? '#ffffff' : 'transparent'
              }}
            >
              Users
            </button>
          )}

          {/* Activity tab (admin only) */}
          {isAdmin && (
            <button
              onClick={() => setActiveSection('activity')}
              style={{
                ...tabButtonStyle,
                backgroundColor: activeSection === 'activity' ? '#ffffff' : 'transparent'
              }}
            >
              Activity
            </button>
          )}
        </div>

        {/* Conditional rendering of sections */}

        {/* User management section */}
        {isAdmin && activeSection === 'users' && (
          <section>
            <UserManagement />
          </section>
        )}

        {/* Activity section */}
        {isAdmin && activeSection === 'activity' && (
          <section>
            <RecentActivity />
          </section>
        )}

        {/* Loan requests section */}
        {isAdmin && activeSection === 'loanRequests' && (
          <section>
            <LoanRequests />
          </section>
        )}

        {/* Default sections */}
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'assets' && <AssetManagement />}
        {activeSection === 'activeLoans' && <ActiveLoans />}
      </main>
    </div>
  );
};

// Shared style for tab buttons
const tabButtonStyle = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s',
  color: '#374151'
};

export default StaffAdminDashboard; // Export component