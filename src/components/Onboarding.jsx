import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

const Onboarding = () => {
  const { setUserProfile } = useWellness();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    contacts: [{ id: Date.now(), name: '', method: '' }]
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty contacts
    const validContacts = formData.contacts.filter(c => c.name.trim() && c.method.trim());
    
    setUserProfile({
      isSetup: true,
      name: formData.name.trim() || 'Student',
      education: formData.education.trim(),
      contacts: validContacts
    });

    // Force navigation to dashboard in case they are on a weird route
    navigate('/', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', borderTop: '4px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', justifyContent: 'center' }}>
          <Brain size={40} className="gradient-text" />
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>MindSync Setup</h1>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Welcome! Let's personalize your wellness experience. These details are stored only on your device.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">What is your name?</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g., Alex" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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

          <div style={{ marginTop: '16px' }}>
            <label className="form-label" style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '8px', marginBottom: '16px' }}>
              Friends & Family Contacts
            </label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Add people you can reach out to when you feel overwhelmed. 
            </p>

            {formData.contacts.map((contact, index) => (
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

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
            Continue to Dashboard <ArrowRight size={20} />
          </button>

        </form>
      </div>
    </div>
  );
};

export default Onboarding;
