import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AssetManagement from '../components/AssetManagement';
import LoanRequests from '../components/LoanRequests';
import ActiveLoans from '../components/ActiveLoans';
import Dashboard from '../components/Dashboard';
import UserManagement from '../components/UserManagement';
import RecentActivity from '../components/RecentActivity';

const StaffAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:7028/api/Users/${user.userId}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchUserDetails();
    }
  }, [user?.userId, user?.token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const displayName = userDetails 
    ? `${userDetails.fname} ${userDetails.lname}` 
    : user?.userId;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
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
            {/* Logo and Title */}
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
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  IT Equipment Management
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  University of Hull - {isAdmin ? 'Admin' : 'Staff'} Portal
                </p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                  {loading ? 'Loading...' : displayName}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {isAdmin ? 'Admin' : 'Staff '}
                </p>
              </div>
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

      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Tab Navigation */}
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          padding: '4px',
          display: 'inline-flex',
          gap: '4px',
          marginBottom: '32px'
        }}>
          <button
            onClick={() => setActiveSection('dashboard')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'dashboard' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'dashboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'dashboard' ? '600' : '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </button>

          <button
            onClick={() => setActiveSection('assets')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'assets' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'assets' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'assets' ? '600' : '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            Equipment
          </button>

          <button
            onClick={() => setActiveSection('loanRequests')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'loanRequests' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'loanRequests' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'loanRequests' ? '600' : '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Loan Requests
          </button>

          <button
            onClick={() => setActiveSection('activeLoans')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'activeLoans' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'activeLoans' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'activeLoans' ? '600' : '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Active Loans
          </button>


          {isAdmin && (
            <button
              onClick={() => setActiveSection('users')}
              style={{
                ...tabButtonStyle,
                backgroundColor: activeSection === 'users' ? '#ffffff' : 'transparent',
                boxShadow: activeSection === 'users' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontWeight: activeSection === 'users' ? '600' : '500'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Users
            </button>

            
            

          )}
              <button
                onClick={() => setActiveSection('activity')}
                style={{
                  ...tabButtonStyle,
                  backgroundColor: activeSection === 'activity' ? '#ffffff' : 'transparent',
                  boxShadow: activeSection === 'activity' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  fontWeight: activeSection === 'activity' ? '600' : '500'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                Activity
             </button>
        </div>
        
            {isAdmin && activeSection === 'users' && (
            <section>
              <UserManagement />
            </section>
)}
        {/* Content Sections */}
        {activeSection === 'dashboard' && <Dashboard />}
        {activeSection === 'assets' && <AssetManagement />}
        {activeSection === 'loanRequests' && <LoanRequests />}
        {activeSection === 'activeLoans' && <ActiveLoans />}
        {activeSection === 'activity' && <RecentActivity />}
       
      </main>
    </div>
  );
};

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

export default StaffAdminDashboard;