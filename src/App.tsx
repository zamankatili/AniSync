import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppStore';
import { Layout } from './components/Layout';
import { PageLoadingSkeleton } from './components/PageLoadingSkeleton';
import { SEOManager } from './components/SEOManager';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { MaintenanceGate } from './components/MaintenanceGate';
import { AnnouncementBanner } from './components/AnnouncementBanner';

// Route-level code splitting using React.lazy for optimized bundle loading
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Discover = lazy(() => import('./pages/Discover').then(m => ({ default: m.Discover })));
const MyList = lazy(() => import('./pages/MyList').then(m => ({ default: m.MyList })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const AnimeDetail = lazy(() => import('./pages/AnimeDetail').then(m => ({ default: m.AnimeDetail })));
const MediaDetail = lazy(() => import('./pages/MediaDetail').then(m => ({ default: m.MediaDetail })));
const ListsPage = lazy(() => import('./pages/Lists').then(m => ({ default: m.ListsPage })));
const AiringCalendar = lazy(() => import('./pages/AiringCalendar').then(m => ({ default: m.AiringCalendar })));
const AnimeGridMaker = lazy(() => import('./pages/AnimeGridMaker').then(m => ({ default: m.AnimeGridMaker })));
const MusicQuiz = lazy(() => import('./pages/MusicQuiz').then(m => ({ default: m.MusicQuiz })));
const VoiceDuel = lazy(() => import('./pages/VoiceDuel').then(m => ({ default: m.VoiceDuel })));
const WatchParty = lazy(() => import('./pages/WatchParty').then(m => ({ default: m.WatchParty })));
const WeeklyChallengePage = lazy(() => import('./pages/WeeklyChallengePage').then(m => ({ default: m.WeeklyChallengePage })));
const AniSyncDle = lazy(() => import('./pages/AniSyncDle').then(m => ({ default: m.AniSyncDle })));
const Arcade = lazy(() => import('./pages/Arcade').then(m => ({ default: m.Arcade })));
const AnimeLifeSim = lazy(() => import('./pages/AnimeLifeSim').then(m => ({ default: m.AnimeLifeSim })));
const FanLore = lazy(() => import('./pages/FanLore').then(m => ({ default: m.FanLore })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then(m => ({ default: m.AdminPage })));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const LegalPage = lazy(() => import('./pages/Legal').then(m => ({ default: m.LegalPage })));

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <SEOManager />
        <MaintenanceGate>
          <AnnouncementBanner />
          <Suspense fallback={<PageLoadingSkeleton />}>
            <Routes>
              <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="challenge" element={<WeeklyChallengePage />} />
              <Route path="polls" element={<WeeklyChallengePage />} />
              <Route path="dle" element={<AniSyncDle />} />
              <Route path="anisyncdle" element={<AniSyncDle />} />
              <Route path="music-quiz" element={<MusicQuiz />} />
<Route path="voice-duel" element={<VoiceDuel />} />
              <Route path="arcade" element={<Arcade />} />
              <Route path="anime-life-sim" element={<AnimeLifeSim />} />
              <Route path="calendar" element={<AiringCalendar />} />
              <Route path="discover" element={<Discover />} />
              <Route path="lore" element={<FanLore />} />
              <Route path="lists" element={<ListsPage />} />
              <Route path="anime/:id" element={<AnimeDetail />} />
              <Route path="media/:id" element={<MediaDetail />} />
              <Route path="privacy" element={<LegalPage kind="privacy" />} />
              <Route path="terms" element={<LegalPage kind="terms" />} />
              <Route path="guidelines" element={<LegalPage kind="guidelines" />} />
              
              {/* Private Routes Protected by PrivateRoute */}
              <Route path="onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
              <Route path="watch-party" element={<PrivateRoute><WatchParty /></PrivateRoute>} />
              <Route path="watch-party/:roomId" element={<PrivateRoute><WatchParty /></PrivateRoute>} />
              <Route path="grid-maker" element={<PrivateRoute><AnimeGridMaker /></PrivateRoute>} />
              <Route path="list" element={<MyList />} />
              <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="profile/:uid" element={<Profile />} />

              {/* Admin Panel — sadece yetkililere */}
              <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
        </MaintenanceGate>
      </BrowserRouter>
    </AppProvider>
  );
}
