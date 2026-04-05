import type { QueryResponse } from '../types/index';
import './Message.css';

interface MessageProps {
  message: {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    response?: QueryResponse;
  };
}

export default function Message({ message }: MessageProps) {
  const getSourceBadgeColor = (source: string) => {
    if (source === 'document') return 'badge-doc';
    if (source === 'general_knowledge') return 'badge-general';
    if (source === 'fallback_document') return 'badge-fallback';
    return 'badge-error';
  };

  return (
    <div className={`message message-${message.type}`}>
      <div className="message-avatar">
        {message.type === 'user' ? '👤' : '🤖'}
      </div>

      <div className="message-content">
        <p className="message-text">{message.content}</p>

        {message.response && (
          <div className="message-metadata">
            <div className={`knowledge-badge ${getSourceBadgeColor(message.response.knowledge_source)}`}>
              {message.response.knowledge_source === 'document' && 'From Documents'}
              {message.response.knowledge_source === 'general_knowledge' && 'General Knowledge'}
              {message.response.knowledge_source === 'fallback_document' && 'From Other Sessions'}
              {message.response.knowledge_source === 'error' && 'Error'}
            </div>

            {message.response.sources && message.response.sources.length > 0 && (
              <div className="sources">
                <p className="sources-label">Sources:</p>
                {message.response.sources.map((source, idx) => (
                  <div key={idx} className="source-item">
                    <span className="source-doc">{source.document}</span>
                    {source.page !== 'N/A' && (
                      <span className="source-page">p. {source.page}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {message.response.mentioned_documents &&
             message.response.mentioned_documents.length > 0 && (
              <div className="mentions">
                <p className="mentions-label">Searched: {message.response.mentioned_documents.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
