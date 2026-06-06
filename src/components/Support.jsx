import React, { useState } from 'react';
import { BookOpen, Wind, Coffee, HeartPulse, X } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

const Support = () => {
  const { moodLogs, userProfile } = useWellness();
  const [showModal, setShowModal] = useState(false);

  const resources = [
    {
      id: 'breathing',
      title: 'Box Breathing Technique',
      description: 'A powerful stress reliever. Breathe in for 4 seconds, hold for 4, exhale for 4, hold for 4. Repeat.',
      icon: <Wind size={32} color="var(--info)" />,
      tag: 'Exercise',
      targetMoods: ['awful', 'bad']
    },
    {
      id: 'anxiety',
      title: 'Managing Exam Anxiety',
      description: 'Break down your syllabus into smaller, manageable chunks. Focus on one topic at a time rather than the entire mountain.',
      icon: <BookOpen size={32} color="var(--warning)" />,
      tag: 'Tip',
      targetMoods: ['awful', 'bad', 'okay']
    },
    {
      id: 'pomodoro',
      title: 'The Pomodoro Technique',
      description: 'Study for 25 minutes, then take a 5-minute break. This prevents burnout and keeps your mind fresh.',
      icon: <Coffee size={32} color="var(--accent-primary)" />,
      tag: 'Productivity',
      targetMoods: ['okay', 'good', 'great']
    },
    {
      id: 'sleep',
      title: 'Physical Wellness = Mental Wellness',
      description: 'Ensure you get at least 7 hours of sleep before an exam. A tired brain cannot recall information effectively.',
      icon: <HeartPulse size={32} color="var(--danger)" />,
      tag: 'Health',
      targetMoods: ['awful', 'bad', 'okay', 'good', 'great']
    }
  ];

  // Personalization logic
  const recentLog = moodLogs.length > 0 ? moodLogs[0] : null;
  let personalizedMessage = '';
  let sortedResources = [...resources];

  if (recentLog) {
    if (recentLog.stressLevel >= 7) {
      personalizedMessage = `We noticed your stress level is high (${recentLog.stressLevel}/10). We highly recommend taking 5 minutes for the Box Breathing Technique.`;
      // Prioritize breathing
      sortedResources = [resources.find(r => r.id === 'breathing'), ...resources.filter(r => r.id !== 'breathing')];
    } else if (recentLog.moodText === 'Awful' || recentLog.moodText === 'Bad') {
      personalizedMessage = `You mentioned feeling ${recentLog.moodText}. Remember, it's okay not to be okay. Take a break and review our anxiety management tips.`;
      sortedResources = [resources.find(r => r.id === 'anxiety'), ...resources.filter(r => r.id !== 'anxiety')];
    } else {
      personalizedMessage = `You're doing ${recentLog.moodText}! Keep up the good work and maintain your productivity with the Pomodoro technique.`;
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>Wellness Space</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Personalized resources and exercises to help you manage stress.</p>
      </div>

      {recentLog && (
        <div className="glass-panel animate-fade-in" style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent-primary)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--accent-primary)' }}>Suggested for you right now</h2>
          <p>{personalizedMessage}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {sortedResources.map((resource, index) => (
          <div key={index} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s', cursor: 'pointer' }} 
               onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                {resource.icon}
              </div>
              <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                {resource.tag}
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{resource.title}</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{resource.description}</p>
          </div>
        ))}
      </div>

      {userProfile?.contacts?.length > 0 && (
        <div className="glass-panel" style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Reach out to your circle</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Sometimes just saying hello to a friend or family member can help.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {userProfile.contacts.map((contact, index) => {
              if (!contact || !contact.method) return null;
              const isEmail = String(contact.method).includes('@');
              const href = isEmail 
                ? `mailto:${contact.method}?subject=Checking%20in&body=Hi%20${contact.name || ''}%2C%20how%20are%20you%3F`
                : `sms:${contact.method}?body=Hi%20${contact.name || ''}%2C%20how%20are%20you%3F`;
              
              return (
                <a key={index} href={href} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>{contact.name || 'Friend'}</span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Message</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ marginTop: '40px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Need immediate help?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>If you are feeling overwhelmed and need someone to talk to, professional help is available.</p>
        <button onClick={() => setShowModal(true)} className="btn-secondary" style={{ background: 'transparent', borderColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}>
          Find Local Helplines
        </button>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', background: 'var(--surface-color)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', paddingRight: '24px' }}>Crisis Helplines</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--bg-color-secondary)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '4px', color: 'var(--accent-primary)' }}>National Emergency</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>911 (US) / 112 (Global)</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-color-secondary)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '4px', color: 'var(--accent-primary)' }}>Suicide & Crisis Lifeline</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>988</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Available 24/7. Free and confidential.</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-color-secondary)', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '4px', color: 'var(--accent-primary)' }}>Crisis Text Line (US/UK)</h3>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Text HOME to 741741</p>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-color-secondary)', borderRadius: '12px', borderLeft: '4px solid var(--info)' }}>
                <h3 style={{ marginBottom: '4px', color: 'var(--info)' }}>India Helplines</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Kiran (Govt.)</p>
                    <p style={{ color: 'var(--text-secondary)' }}>1800-599-0019</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Vandrevala Foundation</p>
                    <p style={{ color: 'var(--text-secondary)' }}>9999 666 555</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>AASRA</p>
                    <p style={{ color: 'var(--text-secondary)' }}>9820466726</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              For international resources, visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)', textDecoration: 'underline' }}>findahelpline.com</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
