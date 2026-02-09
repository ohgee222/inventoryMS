// Import hooks for authentication and navigation
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Add useState and useEffect

const StaffAdminDashboard = () => {
  // Get user data and logout function from AuthContext
  const { user, logout } = useAuth();
  
  // State to store full user details (including name)
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

  // Fetch user details when component mounts
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:7028/api/Users/${user.userId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}` // Include JWT token
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserDetails(data); // Store user details (should include firstName, lastName, etc)
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
  }, [user?.userId, user?.token]); // Re-fetch if userId or token changes

  // Handler function for logout
  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate('/login'); // Redirect to login page
  };

  // Check if current user is Admin (determines what sections to show)
  const isAdmin = user?.role === 'Admin';

  // Display name: use full name if available, otherwise fall back to userId
  const displayName = userDetails 
    ? `${userDetails.fname} ${userDetails.lname}` 
    : user?.userId;

  return (
    <div className="dashboard">
      {/* Dashboard header - shows different title based on role */}
      <header>
        <h1>{isAdmin ? 'Admin' : 'Staff'} Dashboard</h1>
        <div>
          {/* Display user's full name and role */}
          <span>
            Welcome, {loading ? 'Loading...' : displayName} 
          </span><br></br>
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