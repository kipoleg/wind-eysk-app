import type { Station } from '../types/weather';

export const STATIONS: Station[] = [
  { id: '0240', name: 'Ейск' },
  { id: '0328', name: 'Глафировка' },
  { id: '0254', name: 'Камышеватская' },
  { id: '0332', name: 'Бейсуг' },
  { id: '0296', name: 'Лиман' }
];

export const DEFAULT_STATION_ID = STATIONS[0].id;
