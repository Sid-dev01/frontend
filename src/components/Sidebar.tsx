import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>InsightEngine</h1>
        <p>Chat with Documents</p>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/sessions"
          className={`nav-link ${isActive('/sessions') ? 'active' : ''}`}
        >
          <span className="icon">📚</span>
          Sessions
        </Link>

        <Link
          to="/chat"
          className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
        >
          <span className="icon">💬</span>
          Chat
        </Link>
      </nav>

      <div className="sidebar-footer">
        <p className="version">v1.0 Beta</p>
      </div>
    </aside>
  );
}
