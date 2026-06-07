export type Station = {
  id: string;
  name: string;
};

export type ThemeMode = 'light' | 'dark' | 'system';
export type WindUnit = 'ms' | 'kmh' | 'knots';
export type ForecastDay = 'today' | 'tomorrow';

export type WeatherPoint = {
  id: string;
  stationId: string;
  time: string;
  label: string;
  avgWind: number | null;
  gust: number | null;
  minWind: number | null;
  forecastWind?: number | null;
  temp: number | null;
  directionDeg: number | null;
  directionLabel: string;
  pressure: number | null;
  humidity: number | null;
  cloudiness: number | null;
  precipitation: number | null;
  waterTemp: number | null;
  uvIndex: number | null;
};

export type StationWeather = {
  station: Station;
  current: WeatherPoint | null;
  history: WeatherPoint[];
  today: WeatherPoint[];
  tomorrow: WeatherPoint[];
  lastUpdated: string | null;
  fromCache: boolean;
  error: string | null;
};

export type AlertRule = {
  id: string;
  stationId: string;
  threshold: number;
  enabled: boolean;
  lastTriggeredAt?: string;
};

export type CachedPayload<T> = {
  key: string;
  payload: T;
  updatedAt: string;
};

export type SettingsState = {
  theme: ThemeMode;
  refreshInterval: number;
  unit: WindUnit;
};
