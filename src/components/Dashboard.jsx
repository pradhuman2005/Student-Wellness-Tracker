import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Calendar, ArrowRight } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import './Dashboard.css';

const Dashboard = () => {
  const { userProfile, getRecentLogs, getAverageStressLevel, moodLogs } = useWellness();
  const recentLogs = getRecentLogs(3);
  const avgStress = getAverageStressLevel(7);
  
  const getStressColorClass = (level) => {
    if (level <= 3) return 'stress-low';
    if (level <= 7) return 'stress-med';
    return 'stress-high';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          Hello, <span className="gradient-text">{userProfile.name}</span>
        </h1>
        <p className="dashboard-subtitle">Here is your wellness summary for today.</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper" style={{ color: 'var(--accent-primary)' }}>
            <Activity size={28} />
          </div>
          <div className="metric-info">
            <h3>Avg Stress (7 Days)</h3>
            <p className={getStressColorClass(avgStress)}>{avgStress} / 10</p>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrapper" style={{ color: 'var(--info)' }}>
            <Calendar size={28} />
          </div>
          <div className="metric-info">
            <h3>Total Entries</h3>
            <p>{moodLogs.length}</p>
          </div>
        </div>
      </div>

      <div className="recent-logs-section">
        <div className="section-header">
          <h2 className="section-title">Recent Entries</h2>
          <Link to="/insights" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {recentLogs.length > 0 ? (
          <div className="logs-list">
            {recentLogs.map((log) => (
              <div key={log.id} className="log-card glass-panel">
                <div className="log-mood-icon">{log.moodEmoji}</div>
                <div className="log-details">
                  <div className="log-date">{new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                  <div style={{ fontWeight: 500 }}>{log.moodText}</div>
                  {log.triggers && log.triggers.length > 0 && (
                    <div className="log-triggers">
                      {log.triggers.map(t => <span key={t} className="trigger-tag">{t}</span>)}
                    </div>
                  )}
                </div>
                <div className={`stress-indicator ${getStressColorClass(log.stressLevel)}`}>
                  Stress: {log.stressLevel}/10
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>You haven't logged anything yet today.</p>
            <Link to="/log" className="btn-primary">Add Your Mood</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
