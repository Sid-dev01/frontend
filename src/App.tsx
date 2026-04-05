import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Sessions from './pages/Sessions';
import Chat from './pages/Chat';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/chat/:sessionId" element={<Chat />} />
            <Route path="/" element={<Navigate to="/sessions" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
