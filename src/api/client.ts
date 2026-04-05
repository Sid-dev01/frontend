import type { Session, Document, QueryResponse, UploadedDocument } from '../types/index';

// Backend URLs
const INGESTION_API = 'http://localhost:8001/api/v1';
const BRAIN_SERVICE = 'http://localhost:8000';
const VECTOR_STORE = 'http://localhost:8002';

// ==================== INGESTION API ====================

export const ingestionApi = {
  // Sessions
  async createSession(name: string): Promise<Session> {
    const res = await fetch(`${INGESTION_API}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
    return res.json();
  },

  async listSessions(): Promise<Session[]> {
    const res = await fetch(`${INGESTION_API}/sessions`);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async getSession(sessionId: string): Promise<Session> {
    const res = await fetch(`${INGESTION_API}/sessions/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${INGESTION_API}/sessions/${sessionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },

  // Documents
  async uploadDocument(
    sessionId: string,
    file: File,
    documentName: string
  ): Promise<UploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      `${INGESTION_API}/sessions/${sessionId}/documents?document_name=${encodeURIComponent(documentName)}`,
      {
        method: 'POST',
        body: formData,
      }
    );
    if (!res.ok) throw new Error(`Failed to upload document: ${res.statusText}`);
    return res.json();
  },

  async listDocuments(sessionId: string): Promise<Document[]> {
    const res = await fetch(`${INGESTION_API}/sessions/${sessionId}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async deleteDocument(sessionId: string, docId: string): Promise<void> {
    const res = await fetch(
      `${INGESTION_API}/sessions/${sessionId}/documents/${docId}`,
      {
        method: 'DELETE',
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
    const res = await fetch(`${BRAIN_SERVICE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await fetch(`${VECTOR_STORE}/sessions/${sessionId}`);
    if (!res.ok) throw new Error('Failed to fetch session stats');
    return res.json();
  },

  async listCollections() {
    const res = await fetch(`${VECTOR_STORE}/sessions`);
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
