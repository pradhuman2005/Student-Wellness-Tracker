import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useWellness } from '../context/WellnessContext';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = () => {
  const { userProfile, moodLogs } = useWellness();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hi ${userProfile?.name?.split(' ')[0] || 'there'}! I'm your Wellness Assistant. How are you feeling right now?`
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_actual_api_key_here') {
        throw new Error("Missing Gemini API Key in Environment");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build context
      const recentMoods = moodLogs.slice(0, 3).map(log => `${log.moodText} (Stress: ${log.stressLevel}/10)`).join(', ');
      const context = `You are a highly empathetic and supportive mental wellness assistant. 
The user's name is ${userProfile?.name}. 
Their recent moods: ${recentMoods || 'No recent logs'}.
Keep your responses brief, warm, and conversational. Do not give medical advice.`;

      const prompt = `${context}\n\nUser: ${userMessage.text}\nAssistant:`;
      const result = await model.generateContent(prompt);
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: result.response.text()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I encountered an error. Please make sure you have added your VITE_GEMINI_API_KEY to your Cloudflare Pages dashboard environment variables!"
      }]);
    } finally {
      setIsTyping(false);
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
