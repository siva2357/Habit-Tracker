import { Bell, Moon, Sun, Lock, Download, Trash2 } from 'lucide-react';

export default function Settings() {
  return (
    <div className="animate-fade-in pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Settings</h1>
          <p>Customize your application preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
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
            <input type="radio" name="theme" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%' }}><Moon size={20} color="var(--primary)" /></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem' }}>Dark Mode</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Use dark theme</p>
              </div>
            </div>
            <input type="radio" name="theme" />
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
    </div>
  );
}
