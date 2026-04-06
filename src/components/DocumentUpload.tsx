import { useState } from 'react';
import { ingestionApi } from '../api/client';
import './DocumentUpload.css';

interface DocumentUploadProps {
  sessionId: string;
  onUploadSuccess: (filename: string) => void;
}

// Sanitize document name to work with @mention system
const sanitizeName = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, '') // Remove special chars and spaces
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .substring(0, 30) // Limit length
    .toLowerCase(); // Lowercase for consistency
};

export default function DocumentUpload({
  sessionId,
  onUploadSuccess,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        setFile(null);
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      if (!documentName) {
        // Auto-fill with sanitized filename
        const displayName = selectedFile.name.replace('.pdf', '');
        setDocumentName(displayName);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentName.trim()) {
      setError('Please select a file and enter a name');
      return;
    }

    const sanitized = sanitizeName(documentName);
    if (!sanitized) {
      setError('Document name must contain at least one letter or number');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await ingestionApi.uploadDocument(sessionId, file, sanitized);
      setFile(null);
      setDocumentName('');
      onUploadSuccess(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const sanitizedPreview = documentName ? sanitizeName(documentName) : '';

  return (
    <form className="document-upload" onSubmit={handleUpload}>
      <div className="file-input-wrapper">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={uploading}
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          {file ? `📄 ${file.name}` : '📤 Choose PDF'}
        </label>
      </div>

      <div>
        <input
          type="text"
          placeholder="e.g., ML notes or Python basics"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          disabled={uploading}
          maxLength={50}
        />
        {sanitizedPreview && (
          <p style={{margin: '4px 0', fontSize: '12px', color: '#64748b'}}>
            Will be saved as: <strong>@{sanitizedPreview}</strong>
          </p>
        )}
      </div>

      <button type="submit" disabled={!file || uploading || !documentName.trim()}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <div className="error-small">{error}</div>}
    </form>
  );
}
