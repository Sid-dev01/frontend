import type { Document } from '../types/index';
import './DocumentList.css';

interface DocumentListProps {
  documents: Document[];
  sessionId: string;
  onDocumentDeleted: (docId: string) => void;
}

export default function DocumentList({
  documents,
  onDocumentDeleted,
}: DocumentListProps) {
  const handleDelete = async (docId: string) => {
    if (confirm('Delete this document?')) {
      onDocumentDeleted(docId);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="document-list empty">
        <p>No documents yet</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <div key={doc.id} className="document-item">
          <div className="doc-info">
            <p className="doc-name">{doc.name}</p>
            <p className="doc-meta">
              {doc.original_filename}
              {' • '}
              {(doc.size / 1024).toFixed(0)}KB
            </p>
          </div>
          <button
            className="doc-delete"
            onClick={() => handleDelete(doc.id)}
            title="Delete document"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
