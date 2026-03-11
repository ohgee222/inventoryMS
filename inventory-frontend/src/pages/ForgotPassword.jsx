import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:7028/api/Auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Check your email for a reset code. Then enter it below.');
        
        // Navigate to reset password page after 2 seconds
        setTimeout(() => {
          navigate('/reset-password');
        }, 2000);
      } else {
        setError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Forgot Password</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '30px', fontSize: '14px' }}>
          Enter your email to receive a reset code
        </p>

        {message && (
          <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@hull.ac.uk"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: '14px',
                textDecoration: 'underline'
              }}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;