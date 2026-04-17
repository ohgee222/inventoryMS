import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    fname: '',
    lname: '',
    universityId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    department: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleFocus = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
    e.target.style.border = '1px solid rgba(255, 255, 255, 0.5)';
  };

  const handleBlur = (e) => {
    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
    e.target.style.border = '1px solid rgba(255, 255, 255, 0.3)';
  };

  const validate = () => {
    if (Object.values(form).some((v) => !v)) return 'All fields are required.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError('');

    const { confirmPassword, ...payload } = form;

    try {
      const response = await fetch('http://localhost:7028/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch {
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
      padding: '40px 16px',
    }}>
      {/* Animated background blobs */}
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
        maxWidth: '520px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '100px', height: '100px',
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            padding: '15px',
          }}>
            <img
              src="/uoh-logo.png"
              alt="University of Hull"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h2 style={{ color: 'white', margin: 0, fontWeight: '600', fontSize: '22px' }}>
            Create Account
          </h2>
        </div>

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

        {success && (
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: 'white', padding: '12px', borderRadius: '12px',
            marginBottom: '20px', fontSize: '14px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            backdropFilter: 'blur(10px)',
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* First + Last name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>First name</label>
              <input name="fname" type="text" value={form.fname}
                onChange={handleChange} 
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input name="lname" type="text" value={form.lname}
                onChange={handleChange} 
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* University ID + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>University ID</label>
              <input name="universityId" type="text" value={form.universityId}
                onChange={handleChange} 
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="email" type="email" value={form.email}
                onChange={handleChange} 
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Phone + Department */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Phone number</label>
              <input name="phoneNumber" type="tel" value={form.phoneNumber}
                onChange={handleChange} 
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <input name="department" type="text" value={form.department}
                onChange={handleChange} 
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={handleFocus} onBlur={handleBlur}>
              <option value="" style={{ background: '#764ba2' }}>Select role</option>
                <option value="0">Admin</option>
                <option value="1">Staff</option>
                <option value="2">Student</option>
            </select>
          </div>

          {/* Password + Confirm */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={labelStyle}>Password</label>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Min. 6 characters"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} placeholder="Repeat password"
                style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>
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
            {loading ? 'Creating account...' : 'Create Account'}
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
              Already have an account? Sign in
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

export default Register;