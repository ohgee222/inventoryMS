 
// Import hooks for authentication and navigation
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffAdminDashboard = () => {
  // Get user data and logout function from AuthContext
  const { user, logout } = useAuth();
  
  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  // Handler function for logout
  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate('/login'); // Redirect to login page
  };

  // Check if current user is Admin (determines what sections to show)
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="dashboard">
      {/* Dashboard header - shows different title based on role */}
      <header>
        <h1>{isAdmin ? 'Admin' : 'Staff'} Dashboard</h1>
        <div>
          {/* Display user ID and role from decoded JWT */}
          <span>Welcome, {user?.userId} ({user?.role})</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main>
        {/* Section 1: Manage all assets (view, add, edit, delete) */}
        <h2>Asset Management</h2>
        {/* TODO: Fetch assets from GET /api/Assets */}
        {/* TODO: Forms for POST/PUT/DELETE to /api/Assets */}

        {/* Section 2: View and approve/reject pending loan requests */}
        <h2>Loan Requests</h2>
        {/* TODO: Fetch pending requests from GET /api/LoanRequests */}
        {/* TODO: Approve button calls PUT /api/LoanRequests/{id}/approve */}
        {/* TODO: Reject button calls PUT /api/LoanRequests/{id}/reject */}

        {/* Section 3: View all active loans in the system */}
        <h2>Active Loans</h2>
        {/* TODO: Fetch active loans from GET /api/Loans */}
        {/* TODO: Process return button calls PUT /api/Loans/{id}/return */}

        {/* Admin-only sections - only render if user role is Admin */}
        {isAdmin && (
          <>
            {/* Section 4: User management (Admin only) */}
            <h2>User Management</h2>
            {/* TODO: Fetch users from GET /api/Users */}
            {/* TODO: Forms to create/update/deactivate users */}

            {/* Section 5: Reports and analytics (Admin only) */}
            <h2>System Reports</h2>
            {/* TODO: Display statistics - overdue loans, popular items, etc */}
            {/* TODO: Fetch data from various endpoints and aggregate */}
          </>
        )}
      </main>
    </div>
  );
};

export default StaffAdminDashboard;