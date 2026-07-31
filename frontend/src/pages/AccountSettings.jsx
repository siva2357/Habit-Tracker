import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleLayout from '../components/ModuleLayout';
import GlassModal from '../components/GlassModal';
import { User, Lock, Settings } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile State
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Password State
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Delete State
  const [deleteMsg, setDeleteMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setProfileMsg({ type: '', text: '' });
    try {
      const { data } = await api.put('/accountsettings/profile', profile);
      updateUser(data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Error updating profile' });
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordMsg({ type: '', text: '' });
    if (password.newPassword !== password.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
    }
    try {
      await api.put('/accountsettings/password', {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Error changing password' });
    }
  };

  const confirmDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const executeDeleteAccount = async () => {
    try {
      await api.delete('/accountsettings/delete');
      logout();
      navigate('/login');
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err.response?.data?.message || 'Error deleting account' });
      setIsDeleteModalOpen(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ModuleLayout title="Account Settings">
      <div className="glass-panel p-8 max-w-3xl mx-auto w-full">
        
        {/* Tabs */}
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-b-2 border-accent text-accent' : 'text-slate-400 hover:text-white border-b-2 border-transparent'}`}
          >
            <User size={18} /> Profile Details
          </button>
          <button 
            onClick={() => setActiveTab('password')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'password' ? 'border-b-2 border-accent text-accent' : 'text-slate-400 hover:text-white border-b-2 border-transparent'}`}
          >
            <Lock size={18} /> Change Password
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`pb-4 flex items-center gap-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'manage' ? 'border-b-2 border-accent text-accent' : 'text-slate-400 hover:text-white border-b-2 border-transparent'}`}
          >
            <Settings size={18} /> Manage Account
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              <div className="w-24 h-24 shrink-0 rounded-full bg-accent/20 text-accent flex items-center justify-center text-3xl font-bold shadow-lg shadow-accent/10 border border-accent/20">
                {getInitials(user?.fullName)}
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-xl font-bold mb-6">Profile Details</h3>
                {profileMsg.text && (
                  <div className={`mb-6 p-3 rounded-xl ${profileMsg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                    {profileMsg.text}
                  </div>
                )}
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-sm text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.fullName} 
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors" 
                  />
                </div>
                <div className="flex flex-col gap-2 mb-8">
                  <label className="text-sm text-slate-400">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors" 
                  />
                </div>
                <button onClick={handleProfileUpdate} className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-accent/20">Save Profile</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="animate-fade-in flex flex-col items-center">
            <h3 className="text-xl font-bold mb-6 w-full text-center">Change Password</h3>
            {passwordMsg.text && (
              <div className={`mb-6 p-3 w-full max-w-md rounded-xl text-center ${passwordMsg.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                {passwordMsg.text}
              </div>
            )}
            <div className="flex flex-col gap-4 mb-8 w-full max-w-md">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 text-left">Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password" 
                  value={password.currentPassword}
                  onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 text-left">New Password</label>
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  value={password.newPassword}
                  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-slate-400 text-left">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={password.confirmPassword}
                  onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-colors" 
                />
              </div>
            </div>
            <button onClick={handlePasswordUpdate} className="btn-primary px-8 py-3 rounded-xl shadow-lg shadow-accent/20 w-full max-w-md">Update Password</button>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-bold mb-6">Manage Account</h3>
            <p className="text-slate-400 mb-6">These actions are permanent and cannot be undone.</p>
            {deleteMsg.text && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 text-red-400">
                {deleteMsg.text}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-red-400">Delete Account</h4>
                  <p className="text-sm text-slate-400 m-0">Permanently delete your data</p>
                </div>
                <button onClick={confirmDeleteAccount} className="px-6 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-semibold">Delete Account</button>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <GlassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        onSave={executeDeleteAccount}
        saveText="Yes, Permanently Delete"
      >
        <div className="p-4">
          <p className="text-slate-300">Are you sure you want to completely delete your account?</p>
          <p className="text-red-400 mt-2 font-semibold">This action is permanent and cannot be undone.</p>
        </div>
      </GlassModal>
    </ModuleLayout>
  );
};

export default AccountSettings;
