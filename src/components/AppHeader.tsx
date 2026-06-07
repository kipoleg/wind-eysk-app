import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 bg-appBg/90 px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] backdrop-blur-xl dark:bg-[#101215]/90">
      <div className="flex items-center justify-between">
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
    </header>
  );
}
