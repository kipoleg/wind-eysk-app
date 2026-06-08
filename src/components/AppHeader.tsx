import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StationScroller } from './StationScroller'; // Импортируем наш скроллер

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 bg-appBg/90 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-xl dark:bg-[#101215]/90">
      {/* Верхняя часть шапки: Заголовок и Шестерёнка настроек */}
      <div className="flex items-center justify-between px-4">
        <h1 className="text-[28px] font-bold leading-tight text-appText dark:text-white">
          Ветер — Ейский район
        </h1>
        <Link
          to="/settings"
          className="grid h-11 w-11 place-items-center rounded-full text-[#18324A] transition active:scale-95 dark:text-white"
          aria-label="Настройки"
        >
          <Settings size={31} strokeWidth={1.9} />
        </Link>
      </div>

      {/* Нижняя часть шапки: Красивая переключалка станций с крутящимися вентиляторами */}
      <div className="mt-3">
        <StationScroller />
      </div>
    </header>
  );
}