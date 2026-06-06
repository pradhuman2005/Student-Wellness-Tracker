import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';

const Chatbot = () => {
  const { userProfile, moodLogs, apiFetch } = useWellness();
  const [messages, setMessages] = useState([
    { role: 'model', text: `Hi ${userProfile?.name || 'there'}! I'm your Antigravity Wellness Assistant. How are you feeling right now?` }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = { role: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const recentMood = moodLogs.length > 0 ? moodLogs[0] : null;
      let context = `You are a supportive, empathetic mental wellness assistant for a student named ${userProfile?.name || 'student'}. Keep responses concise, helpful, and supportive.`;
      if (recentMood) {
        context += ` The user recently logged their mood as ${recentMood.moodText} with a stress level of ${recentMood.stressLevel}/10.`;
      }

      const data = await apiFetch('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.text, context })
      });

      setMessages(prev => [...prev, { role: 'model', text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error connecting to the secure AI server. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>AI Assistant</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Powered by Antigravity (Secure Backend)</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              gap: '12px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}>
              {msg.role === 'model' && <div style={{ background: 'var(--surface-border)', padding: '8px', borderRadius: '50%', height: 'fit-content' }}><Bot size={20} color="var(--accent-primary)" /></div>}
              
              <div style={{ 
                background: msg.role === 'user' ? 'var(--accent-gradient)' : 'var(--bg-color-secondary)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: msg.role === 'model' ? '4px' : '16px',
                lineHeight: '1.5'
              }}>
                {msg.text}
              </div>

              {msg.role === 'user' && <div style={{ background: 'var(--surface-border)', padding: '8px', borderRadius: '50%', height: 'fit-content' }}><User size={20} /></div>}
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', padding: '12px 16px', background: 'var(--bg-color-secondary)', borderRadius: '16px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ borderTop: '1px solid var(--surface-border)', padding: '16px', background: 'var(--bg-color)' }}>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, margin: 0 }}
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px' }} disabled={isLoading || !inputText.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
