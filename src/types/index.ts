// API Response Types
export interface Session {
  session_id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  doc_count: number;
  documents?: Document[];
}

export interface Document {
  doc_id: string;
  document_name: string;
  filename: string;
  chunks_count: number;
  created_at: string;
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
  status: string;
  session_id: string;
  doc_id: string;
  document_name: string;
  filename: string;
  chunks_processed: number;
  file_size_mb: number;
  message: string;
  timestamp: string;
}

export interface SessionStats {
  session_id: string;
  total_chunks: number;
  documents: string[];
}
