// API Response Types
export interface Session {
  session_id: string;
  name: string;
  created_at: string;
  document_count: number;
}

export interface Document {
  id: string;
  session_id: string;
  name: string;
  original_filename: string;
  uploaded_at: string;
  size: number;
}

export interface QueryResponse {
  question: string;
  answer: string;
  sources: Array<{
    document: string;
    page: string | number;
  }>;
  session_id?: string;
  mentioned_documents?: string[];
  knowledge_source: 'document' | 'general_knowledge' | 'fallback_document' | 'error';
}

export interface UploadedDocument {
  document_name: string;
  chunks: number;
  size: number;
}

export interface SessionStats {
  session_id: string;
  total_chunks: number;
  documents: string[];
}
