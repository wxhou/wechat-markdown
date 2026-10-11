import { BrowserRouter } from 'react-router-dom';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudioPage from './pages/StudioPage';

// Tauri injects this global into the WebView; the desktop build skips the
// landing page and opens the studio directly (design decision 3).
const isTauri = '__TAURI_INTERNALS__' in window;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isTauri ? <Navigate to="/studio" replace /> : <LandingPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}