import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AtmosSync } from './components/AtmosSync';
import { AppShell } from './components/AppShell';
import { Salon } from './pages/Salon';
import { Kesfet } from './pages/Kesfet';
import { Raf } from './pages/Raf';
import { Kose } from './pages/Kose';
import { Ben } from './pages/Ben';
import { Atmosfer } from './pages/Atmosfer';
import { Detay } from './pages/Detay';

export default function App() {
  return (
    <BrowserRouter>
      <AtmosSync />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Salon />} />
          <Route path="kesfet" element={<Kesfet />} />
          <Route path="raf" element={<Raf />} />
          <Route path="kose" element={<Kose />} />
          <Route path="ben" element={<Ben />} />
          <Route path="atmosfer" element={<Atmosfer />} />
          <Route path="m/:type/:id" element={<Detay />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
