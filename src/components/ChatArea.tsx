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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle @mention suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check if user is typing @mention
    const lastAtSign = value.lastIndexOf('@');
    if (lastAtSign !== -1) {
      const afterAt = value.substring(lastAtSign + 1);
      // Show suggestions if we're still typing the mention (no space after @)
      if (!afterAt.includes(' ')) {
        const filtered = documents
          .map(doc => doc.document_name)
          .filter(name =>
            name.toLowerCase().startsWith(afterAt.toLowerCase())
          );
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (docName: string) => {
    const lastAtSign = input.lastIndexOf('@');
    const beforeAt = input.substring(0, lastAtSign);
    const afterAt = input.substring(lastAtSign + 1);
    const beforeMention = afterAt.indexOf(' ');

    let newInput = beforeAt + '@' + docName;
    if (beforeMention !== -1) {
      newInput += afterAt.substring(beforeMention);
    } else {
      newInput += ' ';
    }

    setInput(newInput);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setShowSuggestions(false);
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
            <h3>📚 docGPT</h3>
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
        <div className="input-wrapper" style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask a question... Type @ to mention documents"
            value={input}
            onChange={handleInputChange}
            disabled={loading}
            autoFocus
          />

          {/* @mention suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((docName) => (
                <div
                  key={docName}
                  className="suggestion-item"
                  onClick={() => insertMention(docName)}
                >
                  <span className="mention-icon">@</span>
                  <span className="mention-text">{docName}</span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={!input.trim() || loading}>
            Send
          </button>
        </div>
        <p className="hint-text">
          Tip: Type @ to see all documents in this session, then select one
        </p>
      </form>
    </div>
  );
}
