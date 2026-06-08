import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { PWARequestBanner } from './components/PWARequestBanner'; // ИМПОРТИРУЕМ БАННЕР
import { useWeatherStore } from './store/weatherStore';
import { AlertsPage } from './pages/AlertsPage';
import { HomePage } from './pages/HomePage';
import { SettingsPage } from './pages/SettingsPage';
import { TomorrowPage } from './pages/TomorrowPage';

export function App() {
  const refresh = useWeatherStore((state) => state.refresh);
  const refreshInterval = useWeatherStore((state) => state.settings.refreshInterval);
  const theme = useWeatherStore((state) => state.settings.theme);
  const location = useLocation();

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const timer = window.setInterval(refresh, Math.max(1, refreshInterval) * 60_000);
    return () => window.clearInterval(timer);
  }, [refresh, refreshInterval]);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', theme === 'dark' || (theme === 'system' && prefersDark));
  }, [theme]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-appBg pb-28 text-appText antialiased dark:bg-[#101215]">
      <AppHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tomorrow" element={<TomorrowPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <BottomNav />
      
      {/* ДОБАВЛЕНО: Рендерим плашку запроса установки */}
      <PWARequestBanner />
    </div>
  );
}