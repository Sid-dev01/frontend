import './Sidebar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>docGPT</h1>
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
        {user && (
          <div className="user-info">
            <p className="user-email">{user.email}</p>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
        <p className="version">v1.0 Beta</p>
      </div>
    </aside>
  );
}
