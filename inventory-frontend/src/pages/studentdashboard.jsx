import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BrowseEquipment from '../components/student/BrowseEquipment';
import MyLoanRequests from '../components/student/MyLoanRequests';
import MyActiveLoans from '../components/student/MyActiveLoans';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('browse');
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
                backgroundColor: '#10b981',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  IT Equipment Management
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                  University of Hull - Student Portal
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
                  Student
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
            onClick={() => setActiveSection('browse')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'browse' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'browse' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'browse' ? '600' : '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Browse Equipment
          </button>

          <button
            onClick={() => setActiveSection('requests')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'requests' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'requests' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'requests' ? '600' : '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            My Requests
          </button>

          <button
            onClick={() => setActiveSection('loans')}
            style={{
              ...tabButtonStyle,
              backgroundColor: activeSection === 'loans' ? '#ffffff' : 'transparent',
              boxShadow: activeSection === 'loans' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: activeSection === 'loans' ? '600' : '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            My Active Loans
          </button>
        </div>

        {/* Content Sections */}
        {activeSection === 'browse' && <BrowseEquipment />}
        {activeSection === 'requests' && <MyLoanRequests />}
        {activeSection === 'loans' && <MyActiveLoans />}
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

export default StudentDashboard;