import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppStore';
import { Layout } from './components/Layout';
import { PageLoadingSkeleton } from './components/PageLoadingSkeleton';
import { SEOManager } from './components/SEOManager';
import { PrivateRoute } from './components/PrivateRoute';

// Route-level code splitting using React.lazy for optimized bundle loading
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Discover = lazy(() => import('./pages/Discover').then(m => ({ default: m.Discover })));
const MyList = lazy(() => import('./pages/MyList').then(m => ({ default: m.MyList })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const AnimeDetail = lazy(() => import('./pages/AnimeDetail').then(m => ({ default: m.AnimeDetail })));
const ListsPage = lazy(() => import('./pages/Lists').then(m => ({ default: m.ListsPage })));
const AiringCalendar = lazy(() => import('./pages/AiringCalendar').then(m => ({ default: m.AiringCalendar })));
const AnimeGridMaker = lazy(() => import('./pages/AnimeGridMaker').then(m => ({ default: m.AnimeGridMaker })));
const MusicQuiz = lazy(() => import('./pages/MusicQuiz').then(m => ({ default: m.MusicQuiz })));
const WatchParty = lazy(() => import('./pages/WatchParty').then(m => ({ default: m.WatchParty })));
const WeeklyChallengePage = lazy(() => import('./pages/WeeklyChallengePage').then(m => ({ default: m.WeeklyChallengePage })));
const AniSyncDle = lazy(() => import('./pages/AniSyncDle').then(m => ({ default: m.AniSyncDle })));

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <SEOManager />
        <Suspense fallback={<PageLoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="challenge" element={<WeeklyChallengePage />} />
              <Route path="polls" element={<WeeklyChallengePage />} />
              <Route path="dle" element={<AniSyncDle />} />
              <Route path="anisyncdle" element={<AniSyncDle />} />
              <Route path="music-quiz" element={<MusicQuiz />} />
              <Route path="calendar" element={<AiringCalendar />} />
              <Route path="discover" element={<Discover />} />
              <Route path="anime/:id" element={<AnimeDetail />} />
              
              {/* Private Routes Protected by PrivateRoute */}
              <Route path="watch-party" element={<PrivateRoute><WatchParty /></PrivateRoute>} />
              <Route path="watch-party/:roomId" element={<PrivateRoute><WatchParty /></PrivateRoute>} />
              <Route path="grid-maker" element={<PrivateRoute><AnimeGridMaker /></PrivateRoute>} />
              <Route path="list" element={<PrivateRoute><MyList /></PrivateRoute>} />
              <Route path="lists" element={<PrivateRoute><ListsPage /></PrivateRoute>} />
              <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="profile/:uid" element={<Profile />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}
