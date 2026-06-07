import { Bell, Home, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Главная', icon: Home },
  { to: '/alerts', label: 'Оповещения', icon: Bell },
  { to: '/settings', label: 'Настройки', icon: Settings }
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/92 px-5 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 shadow-[0_-12px_38px_rgba(29,29,31,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#16181d]/92">
      <div className="mx-auto grid max-w-3xl grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[13px] font-medium transition ${
                isActive ? 'text-iosBlue' : 'text-[#526273] dark:text-white/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={30} fill={isActive ? 'currentColor' : 'none'} strokeWidth={1.9} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
