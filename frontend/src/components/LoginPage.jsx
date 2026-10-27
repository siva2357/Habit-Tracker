import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  Terminal, 
  CheckCircle2 
} from 'lucide-react';
import './Auth.css';

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');

    // Simulated auth demo response
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Authentication successful! Connecting to IT developer workspace...');
    }, 800);
  };

  return (
    <motion.div 
      className="auth-page-wrapper"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="auth-card">
        {/* Card Header */}
        <div className="auth-header">
          <div className="auth-badge">
            <Terminal size={13} />
            <span>Developer Workspace</span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to access your sprint boards, tasks, and development logs.
          </p>
        </div>

        {/* Credentials Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Mail size={17} />
              </span>
              <input
                type="email"
                required
                className="auth-input"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label">
              <span>Password</span>
              <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to registered email.'); }}>
                Forgot?
              </a>
            </div>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Lock size={17} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="input-toggle-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div className="form-options-row">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-auth-submit"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            {!isLoading && <ArrowRight size={17} />}
          </button>

          {successMsg && (
            <div className="auth-demo-banner">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}
        </form>

        {/* Footer Navigation */}
        <div className="auth-footer">
          <span>Don't have a developer account? </span>
          <button 
            type="button" 
            className="auth-switch-link"
            onClick={() => onNavigate('register')}
          >
            Create one now
          </button>
        </div>
      </div>

      {/* Return to Home link */}
      <button 
        type="button" 
        className="btn-back-home"
        onClick={() => onNavigate('home')}
      >
        <ArrowLeft size={16} />
        <span>Return to TrackIt Loop Home</span>
      </button>
    </motion.div>
  );
}
