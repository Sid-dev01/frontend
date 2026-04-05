import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ingestionApi } from '../api/client';
import type { Session } from '../types/index';
import '../components/Sessions.css';

export default function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await ingestionApi.listSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    try {
      setCreating(true);
      const newSession = await ingestionApi.createSession(newSessionName);
      setSessions([...sessions, newSession]);
      setNewSessionName('');
      navigate(`/chat/${newSession.session_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      setCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure? This will delete all documents in this session.'))
      return;

    try {
      await ingestionApi.deleteSession(sessionId);
      setSessions(sessions.filter((s) => s.session_id !== sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  };

  const handleOpenChat = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  return (
    <div className="sessions-container">
      <div className="sessions-header">
        <h1>Study Sessions</h1>
        <p>Organize your documents by topic or subject</p>
      </div>

      <form className="create-session-form" onSubmit={handleCreateSession}>
        <input
          type="text"
          placeholder="New session name (e.g., Linear Algebra, Python Basics)"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          disabled={creating}
        />
        <button type="submit" disabled={creating || !newSessionName.trim()}>
          {creating ? 'Creating...' : 'Create Session'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <p>No sessions yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map((session) => (
            <div key={session.session_id} className="session-card">
              <div className="session-info">
                <h3>{session.name}</h3>
                <p className="doc-count">{session.document_count} documents</p>
                <p className="created-date">
                  {new Date(session.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="session-actions">
                <button
                  className="btn-chat"
                  onClick={() => handleOpenChat(session.session_id)}
                >
                  Open Chat →
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteSession(session.session_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
