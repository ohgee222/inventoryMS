// Import hooks for authentication and navigation
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Add useState and useEffect

const StudentDashboard = () => {
  // Get user data and logout function from AuthContext
  const { user, logout } = useAuth();
  
  // State to store full user details (including name)
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // useNavigate hook for programmatic navigation between routes
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

  // Handler function for logout button
  const handleLogout = () => {
    logout(); // Clear token and user data from state and localStorage
    navigate('/login'); // Redirect to login page
  };

  // Display name: use full name if available, otherwise fall back to userId
  const displayName = userDetails 
    ? `${userDetails.fname} ${userDetails.lname}` 
    : user?.userId;

  return (
    <div className="dashboard">
      {/* Dashboard header with title and logout button */}
      <header>
        <h1>Student Dashboard</h1>
        <div>
          {/* Display current user's full name from API */}
          <span>Welcome, {loading ? 'Loading...' : displayName}</span>
          <br></br>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main>
        {/* Section 1: Display student's active and past loans */}
        <h2>My Loans</h2>
        {/* TODO: Fetch and display loans from GET /api/Loans endpoint filtered by student ID */}

        {/* Section 2: Browse available assets for borrowing */}
        <h2>Available Assets</h2>
        {/* TODO: Fetch and display available assets from GET /api/Assets endpoint */}

        {/* Section 3: Form to request new loan */}
        <h2>Request New Loan</h2>
        {/* TODO: Form that POSTs to /api/LoanRequests endpoint */}
      </main>
    </div>
  );
};

export default StudentDashboard;