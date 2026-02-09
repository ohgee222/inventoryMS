import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  // State for controlled form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for error messages
  const [error, setError] = useState('');
  
  // State for loading indicator during API call
  const [loading, setLoading] = useState(false);
  
  // Get login function from AuthContext
  const { login } = useAuth();
  
  // Get navigate function for redirecting after successful login
  const navigate = useNavigate();

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    setError(''); // Clear any previous error messages
    setLoading(true); // Show loading state

    try {
      // Call backend login endpoint via authService
      const response = await authService.login(email, password);
      
      // Store token in localStorage and update AuthContext state
      login(response.token);
      
      // Redirect to dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      // Display error message if login fails
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      // Always turn off loading state when request completes
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {/* Display error message if exists */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Email input field */}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update state on input change
            required
            disabled={loading} // Disable input during API call
          />
        </div>

        {/* Password input field */}
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update state on input change
            required
            disabled={loading} // Disable input during API call
          />
        </div>

        {/* Submit button - shows loading state */}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;