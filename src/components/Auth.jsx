import React, { useState } from 'react';
import { Brain, Lock, Mail, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

const Auth = () => {
  const { login, signup } = useWellness();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '',
    name: '',
    education: '',
    contacts: [{ id: Date.now(), name: '', method: '' }]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { id: Date.now(), name: '', method: '' }]
    }));
  };

  const handleRemoveContact = (id) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id)
    }));
  };

  const handleContactChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const validatePassword = (password) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (!hasLowercase) return "Password must contain at least 1 lowercase letter.";
    if (!hasNumber) return "Password must contain at least 1 number.";
    if (!hasSpecial) return "Password must contain at least 1 special character.";
    if (password.length < 8) return "Password must be at least 8 characters long.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        const validContacts = formData.contacts.filter(c => c.name.trim() && c.method.trim());
        await signup(formData.email, formData.password, {
          name: formData.name.trim() || 'Student',
          education: formData.education.trim(),
          contacts: validContacts
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', borderTop: '4px solid var(--accent-primary)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <Brain size={48} className="gradient-text" />
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>MindSync</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', border: '1px solid var(--danger)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16}/> Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="you@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={16}/> Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {!isLogin && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px', marginTop: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">What is your name?</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Alex" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Education Details (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., High School Senior, Undergrad" 
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                <label className="form-label" style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                  Friends & Family Contacts
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Add people you can reach out to when you feel overwhelmed. 
                </p>

                {formData.contacts.map((contact) => (
                  <div key={contact.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Name" 
                      value={contact.name}
                      onChange={(e) => handleContactChange(contact.id, 'name', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Phone Number" 
                      value={contact.method}
                      onChange={(e) => handleContactChange(contact.id, 'method', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    {formData.contacts.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveContact(contact.id)}
                        className="btn-secondary" 
                        style={{ padding: '0 16px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  type="button" 
                  onClick={handleAddContact}
                  className="btn-secondary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
                >
                  <Plus size={20} /> Add Another Contact
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={20} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
