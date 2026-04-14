import type { Session, Document, QueryResponse, UploadedDocument } from '../types/index';
import { supabase } from '../lib/supabase';

// Backend URLs
const INGESTION_API = 'http://localhost:8001/api/v1';
const BRAIN_SERVICE = 'http://localhost:8000';
const VECTOR_STORE = 'http://localhost:8002';

// Helper to get JWT token from Supabase session
async function getAuthToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }

  return session.access_token;
}

// Helper to get auth headers
async function getAuthHeaders() {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// ==================== INGESTION API ====================

export const ingestionApi = {
  // Sessions
  async createSession(name: string): Promise<Session> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${INGESTION_API}/sessions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
    return res.json();
  },

  async listSessions(): Promise<Session[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${INGESTION_API}/sessions`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    const data = await res.json();
    // API returns { sessions: [...] }, extract the array
    return data.sessions || [];
  },

  async getSession(sessionId: string): Promise<Session> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${INGESTION_API}/sessions/${sessionId}`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async deleteSession(sessionId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${INGESTION_API}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },

  // Documents
  async uploadDocument(
    sessionId: string,
    file: File,
    documentName: string
  ): Promise<UploadedDocument> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      `${INGESTION_API}/sessions/${sessionId}/documents?document_name=${encodeURIComponent(documentName)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      }
    );
    if (!res.ok) throw new Error(`Failed to upload document: ${res.statusText}`);
    return res.json();
  },

  async listDocuments(sessionId: string): Promise<Document[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${INGESTION_API}/sessions/${sessionId}/documents`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    // API returns { documents: [...] }, extract the array
    return data.documents || [];
  },

  async deleteDocument(sessionId: string, docId: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${INGESTION_API}/sessions/${sessionId}/documents/${docId}`,
      {
        method: 'DELETE',
        headers,
      }
    );
    if (!res.ok) throw new Error('Failed to delete document');
  },
};

// ==================== BRAIN SERVICE ====================

export const brainApi = {
  async askQuestion(
    question: string,
    sessionId?: string,
    documentNames?: string[]
  ): Promise<QueryResponse> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BRAIN_SERVICE}/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question,
        session_id: sessionId,
        document_names: documentNames,
      }),
    });
    if (!res.ok) throw new Error(`Failed to get answer: ${res.statusText}`);
    return res.json();
  },

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${BRAIN_SERVICE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};

// ==================== VECTOR STORE ====================

export const vectorStoreApi = {
  async getSessionStats(sessionId: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${VECTOR_STORE}/sessions/${sessionId}`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch session stats');
    return res.json();
  },

  async listCollections() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${VECTOR_STORE}/sessions`, {
      headers,
    });
    if (!res.ok) throw new Error('Failed to fetch collections');
    return res.json();
  },

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${VECTOR_STORE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};
