import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      setSuccessMsg('Account provisioned! Redirecting to workspace setup...');
    }, 900);
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
            <Sparkles size={13} />
            <span>Developer Onboarding</span>
          </div>
          <h2 className="auth-title">Join TrackIt Loop</h2>
          <p className="auth-subtitle">
            Create your engineering profile to start tracking issues, sprints, and code commits.
          </p>
        </div>

        {/* Registration Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <User size={17} />
              </span>
              <input
                type="text"
                name="fullName"
                required
                className="auth-input"
                placeholder="e.g. Alex Turing"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Email</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Mail size={17} />
              </span>
              <input
                type="email"
                name="email"
                required
                className="auth-input"
                placeholder="alex@company.dev"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Role</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Code2 size={17} />
              </span>
              <select
                name="role"
                className="auth-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="DevOps / SRE Engineer">DevOps / SRE Engineer</option>
                <option value="QA / Test Automation">QA / Test Automation</option>
                <option value="Engineering Lead / PM">Engineering Lead / PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Lock size={17} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                className="auth-input"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon-left">
                <Lock size={17} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                minLength={6}
                className="auth-input"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-options-row">
            <label className="terms-label">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span>I agree to Developer Workspace Code & Terms</span>
            </label>
          </div>

          {errorMsg && (
            <div style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-auth-submit"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Creating account...' : 'Create Developer Account'}</span>
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
          <span>Already have a developer account? </span>
          <button 
            type="button" 
            className="auth-switch-link"
            onClick={() => onNavigate('login')}
          >
            Sign in
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
