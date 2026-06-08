import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, Settings } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/alerts', label: 'Оповещения', icon: Bell },
    { path: '/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/5 bg-white/90 pb-safe-bottom backdrop-blur-lg dark:border-white/5 dark:bg-[#1b1e24]/90">
      {/* Сделали компактную панель h-[54px] */}
      <div className="mx-auto flex h-[54px] max-w-md items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-0.5 text-center transition-colors ${
                isActive ? 'text-iosBlue' : 'text-[#526273] dark:text-white/45'
              }`}
            >
              {/* Компактные иконки 22px */}
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.2 : 1.8} 
                className="transition-transform active:scale-95"
              />
              
              {/* Аккуратный мелкий текст */}
              <span className="mt-0.5 text-[10px] font-medium tracking-wide leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}