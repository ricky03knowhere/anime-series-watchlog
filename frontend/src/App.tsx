import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ToastProvider } from '@/contexts/ToastContext';
import MainLayout from '@/layouts/MainLayout';
import DashboardPage from '@/pages/DashboardPage';
import WatchlistPage from '@/pages/WatchlistPage';
import MediaDetailPage from '@/pages/MediaDetailPage';
import Top10Page from '@/pages/Top10Page';
import HistoryPage from '@/pages/HistoryPage';
import TimelinePage from '@/pages/TimelinePage';
import InsightsPage from '@/pages/InsightsPage';
import GenreExplorerPage from '@/pages/GenreExplorerPage';
import StudioExplorerPage from '@/pages/StudioExplorerPage';
import GenresPage from '@/pages/GenresPage';
import GenreDetailPage from '@/pages/GenreDetailPage';
import StudiosPage from '@/pages/StudiosPage';
import StudioDetailPage from '@/pages/StudioDetailPage';

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ToastProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/watchlist/:id" element={<MediaDetailPage />} />
              <Route path="/top-10" element={<Top10Page />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/genre-explorer" element={<GenreExplorerPage />} />
              <Route path="/studio-explorer" element={<StudioExplorerPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/genres/:id" element={<GenreDetailPage />} />
              <Route path="/studios" element={<StudiosPage />} />
              <Route path="/studios/:id" element={<StudioDetailPage />} />
              <Route path="*" element={<DashboardPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
