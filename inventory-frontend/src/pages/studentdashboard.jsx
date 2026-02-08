// Import hooks for authentication and navigation
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  // Get user data and logout function from AuthContext
  const { user, logout } = useAuth();
  
  // useNavigate hook for programmatic navigation between routes
  const navigate = useNavigate();

  // Handler function for logout button
  const handleLogout = () => {
    logout(); // Clear token and user data from state and localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="dashboard">
      {/* Dashboard header with title and logout button */}
      <header>
        <h1>Student Dashboard</h1>
        <div>
          {/* Display current user ID from decoded JWT */}
          <span>Welcome, {user?.userId}</span>
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
