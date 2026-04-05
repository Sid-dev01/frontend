import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ingestionApi } from '../api/client';
import type { Session, Document } from '../types/index';
import DocumentUpload from '../components/DocumentUpload';
import ChatArea from '../components/ChatArea';
import DocumentList from '../components/DocumentList';
import './Chat.css';

export default function Chat() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/sessions');
      return;
    }
    loadSessionData();
  }, [sessionId, navigate]);

  const loadSessionData = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const [sessionData, docsData] = await Promise.all([
        ingestionApi.getSession(sessionId),
        ingestionApi.listDocuments(sessionId),
      ]);
      setSession(sessionData);
      setDocuments(docsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = async () => {
    // Reload documents after upload
    if (sessionId) {
      try {
        const docsData = await ingestionApi.listDocuments(sessionId);
        setDocuments(docsData);
      } catch (err) {
        console.error('Failed to reload documents:', err);
      }
    }
  };

  const handleDocumentDeleted = async (docId: string) => {
    if (sessionId) {
      try {
        await ingestionApi.deleteDocument(sessionId, docId);
        setDocuments(documents.filter((d) => d.id !== docId));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete document'
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="loading">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="chat-container">
        <div className="error-message">Session not found</div>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <div className="chat-sidebar">
        <div className="session-header">
          <button
            className="back-button"
            onClick={() => navigate('/sessions')}
          >
            ← Back
          </button>
          <h2>{session.name}</h2>
        </div>

        <div className="documents-section">
          <h3>Documents</h3>
          {error && <div className="error-message">{error}</div>}

          <DocumentUpload
            sessionId={session.session_id}
            onUploadSuccess={handleDocumentUploaded}
          />

          <DocumentList
            documents={documents}
            sessionId={session.session_id}
            onDocumentDeleted={handleDocumentDeleted}
          />
        </div>
      </div>

      <div className="chat-main">
        <ChatArea sessionId={session.session_id} documents={documents} />
      </div>
    </div>
  );
}
