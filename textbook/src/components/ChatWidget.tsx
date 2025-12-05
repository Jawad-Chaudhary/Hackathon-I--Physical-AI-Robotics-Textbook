import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#0d6efd',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Open chat"
      >
        {isOpen ? 'X' : '?'}
      </button>

      {/* Chat Dialog */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '380px',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              backgroundColor: '#0d6efd',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '16px' }}>AI Tutor</span>
            <div>
              <button
                onClick={clearMessages}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  marginRight: '10px',
                  opacity: 0.8,
                }}
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={toggleChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                }}
                aria-label="Close chat"
              >
                X
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#f8f9fa',
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '40px' }}>
                <p>Ask me anything about Physical AI and Robotics!</p>
                <p style={{ fontSize: '14px' }}>Try: "What is a ROS 2 node?"</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: msg.role === 'user' ? '#0d6efd' : 'white',
                    color: msg.role === 'user' ? 'white' : '#212529',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                      <strong>Sources:</strong>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                        {msg.sources.map((source, idx) => (
                          <li key={idx}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div style={{ textAlign: 'center', color: '#6c757d' }}>
                <span>Thinking...</span>
              </div>
            )}
            {error && (
              <div style={{ textAlign: 'center', color: '#dc3545', fontSize: '14px' }}>
                Error: {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '12px',
              borderTop: '1px solid #dee2e6',
              display: 'flex',
              gap: '8px',
              backgroundColor: 'white',
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #dee2e6',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0d6efd',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: isLoading ? 'wait' : 'pointer',
                opacity: isLoading || !inputValue.trim() ? 0.6 : 1,
                fontWeight: 500,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default ChatWidget;
