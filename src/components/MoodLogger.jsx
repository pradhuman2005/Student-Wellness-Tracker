import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import './MoodLogger.css';

const moods = [
  { emoji: '😭', label: 'Awful', value: 'awful', glowClass: 'mood-glow-1' },
  { emoji: '😔', label: 'Bad', value: 'bad', glowClass: 'mood-glow-2' },
  { emoji: '😐', label: 'Okay', value: 'okay', glowClass: 'mood-glow-3' },
  { emoji: '🙂', label: 'Good', value: 'good', glowClass: 'mood-glow-4' },
  { emoji: '🤩', label: 'Great', value: 'great', glowClass: 'mood-glow-5' },
];

const commonTriggers = [
  'Upcoming Exam', 'Mock Test Results', 'Lack of Sleep', 
  'Peer Pressure', 'Family Expectations', 'Procrastination', 
  'Information Overload', 'Physical Health'
];

const MoodLogger = () => {
  const { addMoodLog } = useWellness();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedMood, setSelectedMood] = useState(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTrigger = (trigger) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    // Auto-advance after a tiny delay for smooth feel
    setTimeout(() => setStep(2), 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMood) return;

    addMoodLog({
      mood: selectedMood.value,
      moodText: selectedMood.label,
      stressLevel: Number(stressLevel),
      triggers: selectedTriggers,
      notes,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="mood-logger-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CheckCircle size={80} color="var(--success)" style={{ marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Check-in Complete</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Taking time to reflect is the first step to wellness.</p>
      </div>
    );
  }

  const containerClass = `mood-logger-container ${selectedMood ? selectedMood.glowClass : ''}`;

  return (
    <div className={containerClass}>
      
      {/* Progress Dots */}
      <div className="step-indicator">
        {[1, 2, 3].map(i => (
          <div key={i} className={`step-dot ${step === i ? 'active' : ''} ${step > i ? 'completed' : ''}`} style={{ background: step > i ? 'var(--accent-primary)' : '' }} />
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* STEP 1: MOOD */}
        {step === 1 && (
          <div className="wizard-step">
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>How are you feeling?</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px' }}>Tap an emotion that best matches your current state.</p>
            
            <div className="mood-selector">
              {moods.map((mood) => (
                <button
                  type="button"
                  key={mood.value}
                  className={`mood-btn ${selectedMood?.value === mood.value ? 'selected' : ''}`}
                  onClick={() => handleMoodSelect(mood)}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: STRESS */}
        {step === 2 && (
          <div className="wizard-step" style={{ width: '100%' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '16px' }}>What is your stress level?</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Use the slider to indicate how overwhelmed you feel right now.</p>
            
            <div className="stress-slider-container">
              <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '32px', color: 'var(--text-primary)' }}>{stressLevel} <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>/ 10</span></h2>
              
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
                className="stress-slider"
              />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <span>Relaxed</span>
                <span>Overwhelmed</span>
              </div>
            </div>

            <div className="navigation-buttons">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none' }}>
                <ArrowLeft size={20} /> Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                Continue <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRIGGERS & NOTES */}
        {step === 3 && (
          <div className="wizard-step" style={{ width: '100%' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '16px' }}>What's driving this?</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Identifying triggers can help you understand your patterns.</p>
            
            <div className="triggers-grid">
              {commonTriggers.map(trigger => (
                <button
                  type="button"
                  key={trigger}
                  className={`trigger-btn ${selectedTriggers.includes(trigger) ? 'selected' : ''}`}
                  onClick={() => toggleTrigger(trigger)}
                >
                  {trigger}
                </button>
              ))}
            </div>

            <div style={{ width: '100%', marginTop: '16px' }}>
              <textarea
                className="form-textarea"
                style={{ minHeight: '120px', borderRadius: '24px', padding: '24px', fontSize: '1.1rem' }}
                placeholder="Any additional thoughts or feelings? Journal them here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="navigation-buttons">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none' }}>
                <ArrowLeft size={20} /> Back
              </button>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', fontSize: '1.2rem' }}>
                <CheckCircle size={24} /> Save Check-in
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default MoodLogger;
