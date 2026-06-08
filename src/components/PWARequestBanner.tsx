import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWARequestBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Проверяем, запущено ли уже как Standalone PWA (чтобы не показывать плашку внутри установленного приложения)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;

    if (isRunningStandalone) return;

    // 2. Ловим событие установки для Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Проверяем, не скрывал ли пользователь её ранее в этой сессии
      if (!sessionStorage.getItem('pwa_banner_dismissed')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 3. Проверяем, является ли устройство iPhone/iPad для показа iOS-подсказки
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isAppleDevice);

    // Для iOS показываем плашку с задержкой в 3 секунды, чтобы не пугать сразу
    if (isAppleDevice && !sessionStorage.getItem('pwa_banner_dismissed')) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    // Показываем системное окно установки Android
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Запоминаем выбор, чтобы не надоедать при каждой перезагрузке внутри текущей сессии
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto rounded-2xl border border-black/5 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-[#1b1e24]/95 animate-fade-in animate-slide-up sm:bottom-24">
      <div className="flex items-start justify-between gap-3">
        
        {/* Иконка и текст */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-iosBlue/10 text-iosBlue">
            <Download size={20} />
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-[15px] font-bold text-[#0D2B48] dark:text-white leading-tight">
              Установить на экран Домой
            </h4>
            <p className="mt-0.5 text-[13px] text-[#526273] dark:text-white/60 leading-normal">
              {isIOS 
                ? 'Нажмите на нижнюю панель «Поделиться», затем выберите «На экран „Домой“».' 
                : 'Установите PWA-приложение для мгновенного доступа к датчикам ветра.'}
            </p>
          </div>
        </div>

        {/* Кнопка закрытия крестиком */}
        <button 
          type="button" 
          onClick={handleDismiss}
          className="text-[#526273] hover:text-[#0D2B48] dark:text-white/40 dark:hover:text-white transition p-0.5"
        >
          <X size={18} />
        </button>
      </div>

      {/* Кнопка действия для Android / Индикатор иконки для iOS */}
      <div className="mt-3 flex justify-end">
        {isIOS ? (
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-iosBlue bg-iosBlue/10 px-3 py-1.5 rounded-xl">
            <span>Ищите иконку</span>
            <Share size={14} strokeWidth={2.5} />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAndroidInstall}
            className="rounded-xl bg-iosBlue px-4 py-1.5 text-[13px] font-bold text-white shadow-sm transition active:scale-95"
          >
            Установить
          </button>
        )}
      </div>

    </div>
  );
}