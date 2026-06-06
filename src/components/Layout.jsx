import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, LineChart, HeartHandshake, Brain, MessageCircle, Moon, Sun } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import './Layout.css';

const Layout = () => {
  const { theme, toggleTheme, logout } = useWellness();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/log', label: 'Add Mood', icon: PlusCircle },
    { path: '/insights', label: 'Insights', icon: LineChart },
    { path: '/support', label: 'Wellness Space', icon: HeartHandshake },
    { path: '/chatbot', label: 'AI Chatbot', icon: MessageCircle },
  ];

  return (
    <div className={`layout-container ${theme}`}>
      <nav className="sidebar">
        <div className="sidebar-logo">
          <Brain size={32} className="gradient-text" />
          <span>MindSync</span>
        </div>
        
        <div className="nav-links" style={{ flex: 1 }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', padding: '20px 48px', borderBottom: '1px solid var(--surface-border)' }}>
          <button 
            onClick={toggleTheme} 
            className="btn-secondary" 
            style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button 
            onClick={logout} 
            className="btn-secondary" 
            style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          >
            <span>Log Out</span>
          </button>
        </header>
        
        <main className="main-content" style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
