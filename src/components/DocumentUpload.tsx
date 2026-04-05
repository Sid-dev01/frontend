import { useState } from 'react';
import { ingestionApi } from '../api/client';
import './DocumentUpload.css';

interface DocumentUploadProps {
  sessionId: string;
  onUploadSuccess: (filename: string) => void;
}

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
        setDocumentName(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentName.trim()) {
      setError('Please select a file and enter a name');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      await ingestionApi.uploadDocument(sessionId, file, documentName);
      setFile(null);
      setDocumentName('');
      onUploadSuccess(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

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

      <input
        type="text"
        placeholder="Document name (e.g., @algebra)"
        value={documentName}
        onChange={(e) => setDocumentName(e.target.value)}
        disabled={uploading}
        maxLength={50}
      />

      <button type="submit" disabled={!file || uploading || !documentName.trim()}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {error && <div className="error-small">{error}</div>}
    </form>
  );
}
