import type { QueryResponse } from '../types/index';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
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
        {message.type === 'user' ? (
          <p className="message-text">{message.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                // Custom heading styling
                h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                h4: ({ children }) => <h4 className="md-h4">{children}</h4>,

                // Custom list styling
                ul: ({ children }) => <ul className="md-list">{children}</ul>,
                ol: ({ children }) => <ol className="md-list-ordered">{children}</ol>,
                li: ({ children }) => <li className="md-list-item">{children}</li>,

                // Custom code styling
                code: (props: any) => {
                  const { inline, children, className } = props;
                  if (inline) {
                    return <code className="md-inline-code">{children}</code>;
                  }
                  return (
                    <code className={`md-code-block ${className || ''}`}>
                      {children}
                    </code>
                  );
                },

                pre: ({ children }) => (
                  <pre className="md-pre">{children}</pre>
                ),

                // Custom blockquote styling
                blockquote: ({ children }) => (
                  <blockquote className="md-blockquote">{children}</blockquote>
                ),

                // Custom table styling
                table: ({ children }) => (
                  <table className="md-table">{children}</table>
                ),
                thead: ({ children }) => (
                  <thead className="md-thead">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="md-tbody">{children}</tbody>
                ),
                tr: ({ children }) => <tr className="md-tr">{children}</tr>,
                th: ({ children }) => <th className="md-th">{children}</th>,
                td: ({ children }) => <td className="md-td">{children}</td>,

                // Custom paragraph styling
                p: ({ children }) => <p className="md-paragraph">{children}</p>,

                // Custom link styling
                a: (props: any) => (
                  <a href={props.href} target="_blank" rel="noopener noreferrer" className="md-link">
                    {props.children}
                  </a>
                ),

                // Custom horizontal rule
                hr: () => <hr className="md-hr" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {message.response && (
          <div className="message-metadata">
            <div className={`knowledge-badge ${getSourceBadgeColor(message.response.knowledge_source)}`}>
              {message.response.knowledge_source === 'document' && '📄 From Documents'}
              {message.response.knowledge_source === 'general_knowledge' && '🧠 General Knowledge'}
              {message.response.knowledge_source === 'fallback_document' && '📚 From Other Sessions'}
              {message.response.knowledge_source === 'error' && '⚠️ Error'}
            </div>

            {message.response.sources && message.response.sources.length > 0 && (
              <div className="sources">
                <p className="sources-label">📖 Sources:</p>
                {message.response.sources.map((source, idx) => (
                  <div key={idx} className="source-item">
                    <span className="source-doc">📄 {source.document}</span>
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
                <p className="mentions-label">
                  🔍 Searched: <strong>{message.response.mentioned_documents.join(', ')}</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
