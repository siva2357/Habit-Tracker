import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const SplashScreen = () => {
  return (
    <div className="page-container" style={{ 
      display: 'flex', 
      flex: 1,
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: 'calc(100vh - 4rem)'
    }}>
      <div className="glass-panel" style={{
        padding: '3rem 4rem',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <img 
          src={logo} 
          alt="TrackIt Logo" 
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            margin: '0 auto 1.5rem',
            display: 'block',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}
        />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>TrackIt</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
          Track Everything. Achieve Anything.
        </p>
        <Link to="/login" className="btn-primary" style={{ width: '100%' }}>
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default SplashScreen;
