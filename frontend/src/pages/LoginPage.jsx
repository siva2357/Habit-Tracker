import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input } from '../components/Input';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleFillDefaultAdmin = () => {
    setEmail('admin@gmail.com');
    setPassword('123456');
    toast.info('Default admin credentials filled!', 'Quick Preset');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back, Admin! Opening Control Panel...', 'Signed In');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } else {
      toast.error(result.message || 'Invalid credentials. Only the personal admin may access.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-6 relative">
      {/* Responsive Login Card on Pure White Background */}
      <motion.div
        className="w-full max-w-[420px] mx-auto relative z-10"
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card variant="glass" className="p-5 sm:p-8 md:p-10 border border-slate-200">
          {/* Application Title Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Track<span className="text-indigo-600">It</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 sm:mt-2 font-medium">
              Personal Life Management System
            </p>
          </div>

          {/* Quick Preset Banner (Responsive wrap for small mobile screens) */}
          <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Zap className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">Admin credentials ready</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleFillDefaultAdmin}
              className="py-1 px-2.5 text-[11px] sm:text-xs shrink-0"
            >
              Quick Fill
            </Button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
              icon={Mail}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pl-10 pr-10 py-2.5 text-sm sm:text-base font-medium text-slate-900 outline-none transition-all duration-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-6 text-sm sm:text-base py-3 sm:py-3.5"
            >
              Sign In to Control Panel
            </Button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Personal application for your life tracking only.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
