import React, { createContext, useState, useEffect, useContext } from 'react';

const WellnessContext = createContext();

export const useWellness = () => useContext(WellnessContext);

// In production, we use the relative path '/api'. In local dev, we might use the exact localhost path.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const WellnessProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('wellness_token'));
  const [userProfile, setUserProfileState] = useState(null);
  const [moodLogs, setMoodLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('wellness_theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wellness_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const apiFetch = async (endpoint, options = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'API Error');
    return data;
  };

  // Auth Functions
  const login = async (email, password) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setToken(data.token);
    localStorage.setItem('wellness_token', data.token);
  };

  const signup = async (email, password, profileData) => {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, ...profileData })
    });
    setToken(data.token);
    localStorage.setItem('wellness_token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUserProfileState(null);
    setMoodLogs([]);
    localStorage.removeItem('wellness_token');
  };

  // Fetch initial data when token changes
  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [profileData, moodsData] = await Promise.all([
          apiFetch('/profile'),
          apiFetch('/moods')
        ]);
        setUserProfileState(profileData);
        setMoodLogs(moodsData);
      } catch (err) {
        console.error("Error loading data:", err);
        if (err.message === 'API Error' || err.message === 'Forbidden') {
          logout(); // Invalid token
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  // Profile Update
  const setUserProfile = async (profileUpdate) => {
    try {
      await apiFetch('/profile', {
        method: 'POST',
        body: JSON.stringify(profileUpdate)
      });
      setUserProfileState(prev => ({ ...prev, ...profileUpdate }));
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  };

  // Mood Logs
  const addMoodLog = async (log) => {
    try {
      const newLog = {
        ...log,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      await apiFetch('/moods', {
        method: 'POST',
        body: JSON.stringify(newLog)
      });
      setMoodLogs((prevLogs) => [newLog, ...prevLogs]);
    } catch (err) {
      console.error("Error saving mood:", err);
    }
  };

  const deleteMoodLog = async (id) => {
    try {
      await apiFetch(`/moods/${id}`, { method: 'DELETE' });
      setMoodLogs((prevLogs) => prevLogs.filter(log => log.id !== id));
    } catch (err) {
      console.error("Error deleting mood:", err);
    }
  };

  const getRecentLogs = (count = 5) => {
    return moodLogs.slice(0, count);
  };

  const getAverageStressLevel = (days = 7) => {
    if (moodLogs.length === 0) return 0;
    const recentLogs = moodLogs.slice(0, days);
    const sum = recentLogs.reduce((acc, log) => acc + Number(log.stressLevel), 0);
    return (sum / recentLogs.length).toFixed(1);
  };

  return (
    <WellnessContext.Provider value={{
      token,
      loading,
      moodLogs,
      userProfile,
      theme,
      login,
      signup,
      logout,
      toggleTheme,
      setUserProfile,
      addMoodLog,
      deleteMoodLog,
      getRecentLogs,
      getAverageStressLevel,
      apiFetch // Expose for chatbot
    }}>
      {children}
    </WellnessContext.Provider>
  );
};
