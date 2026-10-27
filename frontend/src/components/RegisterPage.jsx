import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Code2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import './Auth.css';

export default function RegisterPage({ onNavigate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Full Stack Engineer',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleNavigate = (path) => {
    if (onNavigate) {
      onNavigate(path);
    }
    navigate(path);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMsg('Please accept the developer workspace terms to proceed.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Account provisioned! Opening workspace...');
      setTimeout(() => {
        handleNavigate('/dashboard');
      }, 500);
    }, 700);
  };

  return (
    <motion.div 
      className="auth-page-wrapper"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="auth-card register-card">
        {/* Card Header */}
        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={13} />
            <span>Join TrackIt Jira</span>
          </div>
          <h2 className="auth-title">Create Developer Account</h2>
          <p className="auth-subtitle">
            Get started with unified agile planning, sprint backlog tracking, and team workspaces.
          </p>
        </div>

        {/* Registration Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="auth-error-banner">
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={17} />
              <input 
                type="text"
                name="fullName"
                className="auth-input"
                placeholder="Alex Chen"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={17} />
              <input 
                type="email"
                name="email"
                className="auth-input"
                placeholder="alex.chen@workspace.io"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Engineering Role / Focus</label>
            <div className="input-wrapper">
              <Code2 className="input-icon" size={17} />
              <select 
                name="role"
                className="auth-input auth-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="DevOps / Cloud Architect">DevOps / Cloud Architect</option>
                <option value="Engineering Lead">Engineering Lead</option>
                <option value="Product Designer">Product Designer</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={17} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="auth-input"
                  placeholder="Min 8 chars"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={17} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="auth-input"
                  placeholder="Re-type password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
          </div>

          <div className="form-options-row">
            <label className="remember-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span>I agree to Developer Terms of Service and Privacy Policy</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn-auth-submit"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Creating Account...' : 'Create Developer Workspace'}</span>
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
          <span>Already have an account? </span>
          <button 
            type="button" 
            className="auth-switch-link"
            onClick={() => handleNavigate('/login')}
          >
            Sign in now
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
