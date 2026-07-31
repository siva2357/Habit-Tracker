import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../services/api';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      await api.post('/login/reset-password', { email, newPassword });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="page-container" style={{
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 4rem)'
    }}>
      <div className="glass-panel" style={{
        padding: '3rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <img
          src={logo}
          alt="TrackIt Logo"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            margin: '0 auto 1rem',
            display: 'block',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        />
        <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Enter a new password for {email}
        </p>

        {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', background: 'rgba(255, 107, 107, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
        {message && <div style={{ color: '#4CAF50', marginBottom: '1rem', background: 'rgba(76, 175, 80, 0.1)', padding: '10px', borderRadius: '8px' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.05)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.05)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
