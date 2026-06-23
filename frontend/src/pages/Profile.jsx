import { useState } from 'react';
import { User, Mail, Shield, Bell, Moon, Sun, Download, Trash2, Settings as SettingsIcon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('account');
  const { theme, setTheme } = useTheme();

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userName = userInfo.name || 'User';
  const userEmail = userInfo.email || 'user@example.com';

  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1>Profile & Settings</h1>
          <p>Manage your account details and application preferences.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <button 
          className="btn" 
          style={{ 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'account' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'account' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: '0',
            padding: '0.5rem 1rem'
          }}
          onClick={() => setActiveTab('account')}
        >
          <User size={18} /> Account Details
        </button>
        <button 
          className="btn" 
          style={{ 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'preferences' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'preferences' ? 'var(--primary)' : 'var(--text-muted)',
            borderRadius: '0',
            padding: '0.5rem 1rem'
          }}
          onClick={() => setActiveTab('preferences')}
        >
          <SettingsIcon size={18} /> Preferences
        </button>
      </div>

      {activeTab === 'account' && (
        <div className="card glass animate-fade-in" style={{ marginTop: '1.5rem' }}>
          <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{userName}</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Active Member</p>
          </div>

          <form style={{ maxWidth: '600px' }}>
            <div className="input-group mb-4">
              <label className="flex items-center gap-2"><User size={16} /> Full Name</label>
              <input type="text" className="input-field" defaultValue={userName} />
            </div>

            <div className="input-group mb-4">
              <label className="flex items-center gap-2"><Mail size={16} /> Email Address</label>
              <input type="email" className="input-field" defaultValue={userEmail} disabled style={{ opacity: 0.7 }} />
            </div>
            
            <div className="input-group mb-6">
              <label className="flex items-center gap-2"><Shield size={16} /> New Password</label>
              <input type="password" className="input-field" placeholder="Leave blank to keep current password" />
            </div>

            <button type="button" className="btn btn-primary" onClick={() => alert('Profile updated successfully!')}>
              Save Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="animate-fade-in charts-grid" style={{ marginTop: '1.5rem' }}>
          
          {/* Appearance */}
          <div className="card glass">
            <h3 className="mb-4" style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Appearance</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}><Sun size={20} color="var(--primary)" /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Light Mode</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Use light theme</p>
                </div>
              </div>
              <input type="radio" name="theme" checked={theme === 'light'} onChange={() => setTheme('light')} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}><Moon size={20} color="var(--primary)" /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Dark Mode</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Use dark theme</p>
                </div>
              </div>
              <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => setTheme('dark')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}><Monitor size={20} color="var(--primary)" /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>System Default</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Follow OS setting</p>
                </div>
              </div>
              <input type="radio" name="theme" checked={theme === 'system'} onChange={() => setTheme('system')} />
            </div>
          </div>

          {/* Notifications */}
          <div className="card glass">
            <h3 className="mb-4" style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Notifications</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%' }}><Bell size={20} color="var(--success)" /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Daily Reminders</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Push notifications for tasks</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%' }}><Bell size={20} color="var(--warning)" /></div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Weekly Reports</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Email summary of progress</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="card glass" style={{ gridColumn: '1 / -1' }}>
            <h3 className="mb-4" style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Data & Privacy</h3>
            <div className="flex items-center justify-between mb-4 p-3" style={{ background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <Download size={20} color="var(--primary)" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Export Data</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Download all your account data as JSON.</p>
                </div>
              </div>
              <button className="btn btn-outline" onClick={() => alert('Downloading data...')}>Export</button>
            </div>
            <div className="flex items-center justify-between p-3" style={{ background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div className="flex items-center gap-3">
                <Trash2 size={20} color="var(--danger)" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--danger)' }}>Delete Account</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Permanently remove your account and all data.</p>
                </div>
              </div>
              <button className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => confirm('Are you sure? This cannot be undone.')}>Delete</button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
