import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWellness } from '../context/WellnessContext';

const Insights = () => {
  const { moodLogs } = useWellness();

  // Prepare data for chart (reverse so oldest is first for the timeline)
  const chartData = [...moodLogs].reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    stress: log.stressLevel,
    mood: log.moodText
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(139, 92, 246, 0.5)' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>{label}</p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Stress: <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{payload[0].value} / 10</span>
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>Mood: {payload[0].payload.mood}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>Analytics & Insights</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize your mental wellness journey over time.</p>
      </div>

      <div className="glass-panel" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Stress Level Timeline</h2>
        
        {chartData.length >= 2 ? (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={[0, 10]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="stress" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStress)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Log at least two entries to see your stress trends over time.</p>
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="glass-panel">
          <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Top Triggers</h3>
          {moodLogs.length > 0 ? (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Calculate triggers frequency */}
              {Object.entries(
                moodLogs.flatMap(log => log.triggers || []).reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {})
              )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([trigger, count], index) => (
                <li key={trigger} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <span>{index + 1}. {trigger}</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{count} times</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No triggers recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;
