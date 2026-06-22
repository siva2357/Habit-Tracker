import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', habits: 4, tasks: 5 },
  { name: 'Tue', habits: 3, tasks: 4 },
  { name: 'Wed', habits: 5, tasks: 6 },
  { name: 'Thu', habits: 4, tasks: 3 },
  { name: 'Fri', habits: 6, tasks: 7 },
  { name: 'Sat', habits: 2, tasks: 2 },
  { name: 'Sun', habits: 5, tasks: 4 },
];

export default function Dashboard() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Welcome Back, Alex! 👋</h1>
          <p>Here's a summary of your progress this week.</p>
        </div>
        <button className="btn btn-primary">New Entry</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card glass">
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>Habits Completed</h3>
          <div className="flex items-center gap-2 mt-4">
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>24</span>
            <span style={{ color: 'var(--success)', fontWeight: 500 }}>+12%</span>
          </div>
        </div>
        
        <div className="card glass">
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>Tasks Done</h3>
          <div className="flex items-center gap-2 mt-4">
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>31</span>
            <span style={{ color: 'var(--danger)', fontWeight: 500 }}>-5%</span>
          </div>
        </div>

        <div className="card glass">
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>Current Streak</h3>
          <div className="flex items-center gap-2 mt-4">
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>5 Days</span>
            <span style={{ color: 'var(--warning)', fontWeight: 500 }}>🔥</span>
          </div>
        </div>
      </div>

      <div className="card glass">
        <h2>Activity Overview</h2>
        <p>Your habit completion and task execution over the last 7 days.</p>
        <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)' }}
              />
              <Line type="monotone" dataKey="habits" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="tasks" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
