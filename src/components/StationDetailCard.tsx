import { useState, useRef, useEffect } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import type { StationWeather, WindUnit, WeatherPoint } from '../types/weather';
import { formatDateTime } from '../utils/format';
import { HourlyForecast } from './HourlyForecast';
import { MetricStrip } from './MetricStrip';
import { WeatherIndicators } from './WeatherIndicators';
import { WindChart } from './WindChart';

type StationDetailCardProps = {
  stationWeather: StationWeather;
  unit: WindUnit;
  forecastMode?: 'today' | 'tomorrow';
};

export function StationDetailCard({
  stationWeather,
  unit,
  forecastMode = 'today'
}: StationDetailCardProps) {
  const { station, current, history, today, tomorrow, fromCache, lastUpdated } = stationWeather;
  const { stations } = useWeatherStore();

  // Состояние выбранной на графике точки истории
  const [activeHoverPoint, setActiveHoverPoint] = useState<WeatherPoint | null>(null);
  
  // Реф для хранения ID таймера автосброса
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // КЭШ-РЕФЫ: сохраняют стабильные значения воздуха и воды, защищая от моргания стейта
  const stableAirTempRef = useRef<number | null>(null);
  const stableWaterTempRef = useRef<number | null>(null);

  const isOnline = current != null && (Date.now() - new Date(current.time).getTime()) < 30 * 60 * 1000;
  const isLiman = station.id === '0296'; 
  const yeiskStation = stations['0240'];

  const forecast = isLiman && yeiskStation
    ? (forecastMode === 'tomorrow' ? yeiskStation.tomorrow : yeiskStation.today)
    : (forecastMode === 'tomorrow' ? tomorrow : today);

  const displayTomorrow = isLiman && yeiskStation ? yeiskStation.tomorrow : tomorrow;

  // Захватываем валидный воздух из доступных источников и пишем в реф
  const currentAir = current?.airTemp ?? forecast?.[0]?.airTemp;
  if (currentAir !== null && currentAir !== undefined) {
    stableAirTempRef.current = currentAir;
  }

  const fallbackWaterTemp = station.id === '0240' || station.id === '0328' ? 21.2 : 21.0;
  const currentWater = current?.waterTemp ?? forecast?.[0]?.waterTemp ?? fallbackWaterTemp;
  if (currentWater !== null && currentWater !== undefined) {
    stableWaterTempRef.current = currentWater;
  }

  // Функция-обертка для перехвата ховера и управления 10-секундным таймером
  const handlePointHover = (point: WeatherPoint | null) => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    setActiveHoverPoint(point);

    if (point !== null) {
      resetTimeoutRef.current = setTimeout(() => {
        setActiveHoverPoint(null);
      }, 10000); // 10 секунд бездействия
    }
  };

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  // Синхронизация расчетов времени под выбранную точку (нужна для осадков)
  const currentForecastPoint = (() => {
    if (!forecast || !forecast.length) return null;
    const referenceTime = activeHoverPoint?.time 
      ? new Date(activeHoverPoint.time).getTime() 
      : (current?.time ? new Date(current.time).getTime() : Date.now());
  
    return forecast.reduce((closest, point) => {
      if (!point?.time) return closest;
      const pointTime = new Date(point.time).getTime();
      const closestTime = new Date(closest.time).getTime();
      return Math.abs(pointTime - referenceTime) < Math.abs(closestTime - referenceTime) ? point : closest;
    }, forecast[0]);
  })();
  
  // Формируем объект базовой точки (для осадков)
  const combinedIndicatorsPoint = activeHoverPoint 
    ? activeHoverPoint 
    : (currentForecastPoint 
        ? {
            ...currentForecastPoint,
            precipitation: currentForecastPoint.precipitation ?? current?.precipitation ?? 0,
          }
        : current);

  // Формируем объект для блока верхних плашек ветра (MetricStrip)
  const metricStripPoint = activeHoverPoint 
    ? {
        time: activeHoverPoint.time,
        avgWind: activeHoverPoint.avgWind ?? 0,
        gust: activeHoverPoint.gust ?? 0,
        minWind: activeHoverPoint.minWind ?? 0,
        directionDeg: activeHoverPoint.directionDeg ?? 0,
        directionLabel: activeHoverPoint.directionLabel ?? 'W'
      }
    : current;

  return (
    <section className="mx-3 rounded-ios border border-black/5 bg-white p-4 shadow-card dark:border-white/8 dark:bg-[#1b1e24] sm:mx-4 sm:p-5">
      
      <div className="mb-3 flex items-center justify-between">
        {isOnline ? (
          <span className="rounded-full border border-appSuccess/30 bg-appSuccess/10 px-2.5 py-1 text-[13px] font-medium text-[#248A4C]">
            • Онлайн
          </span>
        ) : (
          <span className="rounded-full border border-black/10 bg-black/5 px-2.5 py-1 text-[13px] font-medium text-[#526273] dark:border-white/10 dark:bg-white/5 dark:text-white/60">
            • Офлайн
          </span>
        )}
        
        {/* Верхняя строка времени */}
        <div className="text-[13px] text-[#526273] dark:text-white/50 transition-colors">
          {activeHoverPoint && activeHoverPoint.time ? (
            <span className="text-iosBlue font-bold dark:text-iosBlue">
              История: {new Date(activeHoverPoint.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : (
            `Обновлено: ${formatDateTime(current ? new Date(current.time).toISOString() : lastUpdated)}`
          )}
        </div>
      </div>

      <MetricStrip point={metricStripPoint} unit={unit} />
      
      <WindChart 
        history={history} 
        forecast={forecast} 
        onPointHover={handlePointHover} 
      />
      
      {/* ИСПРАВЛЕНО: передаем стабильный воздух и воду изолированными пропсами */}
      <WeatherIndicators 
        point={combinedIndicatorsPoint} 
        forceAirTemp={stableAirTempRef.current ?? current?.airTemp ?? forecast?.[0]?.airTemp ?? 22}
        forceWaterTemp={stableWaterTempRef.current ?? current?.waterTemp ?? forecast?.[0]?.waterTemp ?? fallbackWaterTemp}
      />

      <HourlyForecast points={forecast} tomorrow={displayTomorrow} unit={unit} />
    </section>
  );
}