import React, { createContext, useState, useEffect, useContext } from 'react';

const WellnessContext = createContext();

export const useWellness = () => useContext(WellnessContext);

export const WellnessProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('wellness_token'));
  
  const [userProfile, setUserProfileState] = useState(() => {
    const saved = localStorage.getItem('wellness_profile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [moodLogs, setMoodLogs] = useState(() => {
    const saved = localStorage.getItem('wellness_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('wellness_theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('wellness_theme', theme);
  }, [theme]);

  // Persist Data whenever it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('wellness_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('wellness_profile');
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('wellness_logs', JSON.stringify(moodLogs));
  }, [moodLogs]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const login = async (email, password) => {
    // Fake login
    if (userProfile && userProfile.email === email && userProfile.password === password) {
      const fakeToken = 'local-device-token';
      localStorage.setItem('wellness_token', fakeToken);
      setToken(fakeToken);
      return { success: true };
    }
    throw new Error('Invalid email or password');
  };

  const signup = async (userData) => {
    const profile = {
      ...userData,
      isSetup: true
    };
    setUserProfileState(profile);
    const fakeToken = 'local-device-token';
    localStorage.setItem('wellness_token', fakeToken);
    setToken(fakeToken);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('wellness_token');
    // Keeping profile and logs on the device, just clearing the active session
    setToken(null);
  };

  const addMoodLog = (log) => {
    const newLog = {
      ...log,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setMoodLogs(prev => [newLog, ...prev]);
  };

  const deleteMoodLog = (id) => {
    setMoodLogs(prev => prev.filter(log => log.id !== id));
  };

  const updateUserProfile = (data) => {
    setUserProfileState(prev => ({ ...prev, ...data }));
  };

  const value = {
    theme,
    toggleTheme,
    token,
    userProfile,
    moodLogs,
    login,
    signup,
    logout,
    addMoodLog,
    deleteMoodLog,
    updateUserProfile,
    loading: false
  };

  return (
    <WellnessContext.Provider value={value}>
      {children}
    </WellnessContext.Provider>
  );
};
