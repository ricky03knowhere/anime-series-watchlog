import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ToastProvider } from '@/contexts/ToastContext';
import MainLayout from '@/layouts/MainLayout';
import DashboardPage from '@/pages/DashboardPage';
import WatchlistPage from '@/pages/WatchlistPage';
import MediaDetailPage from '@/pages/MediaDetailPage';
import {
  Top10Page,
  HistoryPage,
  GenresPage,
  StudiosPage,
  InsightsPage,
  NotFoundPage,
} from '@/pages/PlaceholderPages';

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
              <Route path="/genres" element={<GenresPage />} />
              <Route path="/studios" element={<StudiosPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
