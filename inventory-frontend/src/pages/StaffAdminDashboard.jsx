import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AssetManagement from '../components/AssetManagement';
import LoanRequests from '../components/LoanRequests';
const StaffAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null); // Track active section
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:7028/api/Users/${user.userId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
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
    <div className="dashboard">
      <header>
        <h1>{isAdmin ? 'Admin' : 'Staff'} Dashboard</h1>
        <div>
          <span>Welcome, {loading ? 'Loading...' : displayName}</span><br />
          <br />
          <button onClick={handleLogout}>Logout</button><br />
        </div>
      </header>
      <br />
      <nav>
        <button onClick={() => setActiveSection('assets')}>Asset Management</button><br /><br />
        <button onClick={() => setActiveSection('loanRequests')}>Loan Requests</button><br /><br />
        <button onClick={() => setActiveSection('activeLoans')}>Active Loans</button><br /><br />
        {isAdmin && (
          <>
            <button onClick={() => setActiveSection('users')}>User Management</button><br /><br />
            <button onClick={() => setActiveSection('reports')}>System Reports</button><br /><br />
          </>
        )}
      </nav>

      <main>
        {activeSection === 'assets' && (
          <section>
            <h2>Asset Management</h2>
            <AssetManagement />
          </section>
        )}

        {activeSection === 'loanRequests' && (
          <section>
            <h2>Loan Requests</h2>
            {/* TODO: Component for loan requests */}
            <LoanRequests />
          </section>
        )}

        {activeSection === 'activeLoans' && (
          <section>
            <h2>Active Loans</h2>
            {/* TODO: Component for active loans */}
          </section>
        )}

        {isAdmin && activeSection === 'users' && (
          <section>
            <h2>User Management</h2>
            {/* TODO: Component for user management */}
          </section>
        )}

        {isAdmin && activeSection === 'reports' && (
          <section>
            <h2>System Reports</h2>
            {/* TODO: Component for reports */}
          </section>
        )}

        {!activeSection && (
          <div>
            <p>Select a section from the menu above to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffAdminDashboard;