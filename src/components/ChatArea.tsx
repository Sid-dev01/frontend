import { useState, useRef, useEffect } from 'react';
import { brainApi } from '../api/client';
import type { Document, QueryResponse } from '../types/index';
import Message from './Message';
import './ChatArea.css';

interface ChatAreaProps {
  sessionId: string;
  documents: Document[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  response?: QueryResponse;
}

export default function ChatArea({ sessionId, documents }: ChatAreaProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      setLoading(true);
      const response = await brainApi.askQuestion(userMessage, sessionId);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        response,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-area">
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="empty-chat">
            <h3>🍳 Let me Cook! 🍳</h3>
            <p>Start by asking a question about your documents</p>
            {documents.length === 0 && (
              <p className="hint">💡 Try uploading a document first</p>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Thinking...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        {error && <div className="error-message">{error}</div>}
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Ask a question... (use @mention for specific docs)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={!input.trim() || loading}>
            Send
          </button>
        </div>
        <p className="hint-text">
          Tip: Use @algebra or @python to search specific documents
        </p>
      </form>
    </div>
  );
}
