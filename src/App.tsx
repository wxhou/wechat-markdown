import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudioPage from './pages/StudioPage';
import { bootThemeMode } from './lib/theme-mode';
import { isTauri } from './lib/platform';

export default function App() {
  useEffect(() => bootThemeMode(), []);
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