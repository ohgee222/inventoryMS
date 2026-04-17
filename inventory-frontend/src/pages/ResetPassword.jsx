import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:7028/api/Auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    fontSize: '15px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    backdropFilter: 'blur(10px)',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%',
        width: '500px', height: '500px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%', filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '400px', height: '400px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%', filter: 'blur(80px)',
      }} />

      {/* Glass card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', margin: '0 0 8px 0', fontWeight: '600', fontSize: '22px' }}>
            Reset Password
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '14px' }}>
            Enter the code from your email and your new password
          </p>
        </div>

        {message && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: 'white', padding: '12px', borderRadius: '12px',
            marginBottom: '20px', fontSize: '14px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: 'white', padding: '12px', borderRadius: '12px',
            marginBottom: '20px', fontSize: '14px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Reset code */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Reset Code</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000000"
              required
              maxLength={6}
              style={{
                ...inputStyle,
                fontSize: '24px',
                letterSpacing: '12px',
                textAlign: 'center',
                fontFamily: 'monospace',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
              }}
            />
          </div>

          {/* New password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
              }}
            />
          </div>

          {/* Confirm password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              border: 'none', fontSize: '16px', fontWeight: '600',
              color: '#667eea', background: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease', marginBottom: '16px',
            }}
            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none', color: 'white',
                cursor: 'pointer', fontSize: '14px',
                textDecoration: 'underline', opacity: 0.9,
              }}
            >
              Back to Login
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '30px', textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px',
        }}>
          University of Hull • Computer Science Department
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;