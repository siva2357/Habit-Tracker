import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/signup', formData);
      login(data, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong during sign up.');
    } finally {
      setLoading(false);
    }
  };

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
        <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Join TrackIt today
        </p>

        {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', background: 'rgba(255, 107, 107, 0.1)', padding: '10px', borderRadius: '8px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <input 
              type="text" 
              name="fullName"
              placeholder="Full Name" 
              value={formData.fullName}
              onChange={handleChange}
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
              type="email" 
              name="email"
              placeholder="Email address" 
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
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
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-color)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
