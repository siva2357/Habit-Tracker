import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex.chen@workspace.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
    navigate(path);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');

    // Simulated auth demo response
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Authentication successful! Opening workspace...');
      setTimeout(() => {
        handleNavigate('/dashboard');
      }, 500);
    }, 600);
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
            Sign in to access your sprint boards, backlog issues, and release roadmaps.
          </p>
        </div>

        {/* Credentials Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={17} />
              <input 
                type="email"
                className="auth-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Password</label>
              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Forgot?
              </a>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={17} />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
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
            onClick={() => handleNavigate('/register')}
          >
            Create one now
          </button>
        </div>
      </div>

      {/* Return to Home link */}
      <button 
        type="button" 
        className="btn-back-home"
        onClick={() => handleNavigate('/')}
      >
        <ArrowLeft size={16} />
        <span>Return to TrackIt Jira Home</span>
      </button>
    </motion.div>
  );
}
