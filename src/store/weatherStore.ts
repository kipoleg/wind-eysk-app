import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_STATION_ID, STATIONS } from '../data/stations';
import { fetchAllStations } from '../services/api';
import { evaluateAlertRules } from '../services/notifications';
import type { AlertRule, SettingsState, StationWeather } from '../types/weather';

type WeatherStore = {
  stations: Record<string, StationWeather>;
  activeStationId: string;
  favorites: string[];
  alertRules: AlertRule[];
  settings: SettingsState;
  loading: boolean;
  lastUpdated: string | null;
  globalError: string | null;
  setActiveStation: (stationId: string) => void;
  toggleFavorite: (stationId: string) => void;
  refresh: () => Promise<void>;
  addAlertRule: (stationId: string, threshold: number) => void;
  updateAlertRule: (rule: AlertRule) => void;
  removeAlertRule: (ruleId: string) => void;
  updateSettings: (settings: Partial<SettingsState>) => void;
};

const initialStations = Object.fromEntries(
  STATIONS.map((station) => [
    station.id,
    {
      station,
      current: null,
      history: [],
      today: [],
      tomorrow: [],
      lastUpdated: null,
      fromCache: false,
      error: null
    } satisfies StationWeather
  ])
);

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      stations: initialStations,
      activeStationId: DEFAULT_STATION_ID,
      favorites: [],
      alertRules: [
        { id: crypto.randomUUID(), stationId: '0240', threshold: 8, enabled: true },
        { id: crypto.randomUUID(), stationId: '0328', threshold: 10, enabled: true },
        { id: crypto.randomUUID(), stationId: '0296', threshold: 12, enabled: true }
      ],
      settings: {
        theme: 'light',
        refreshInterval: 5,
        unit: 'ms'
      },
      loading: false,
      lastUpdated: null,
      globalError: null,
      setActiveStation: (stationId) => set({ activeStationId: stationId }),
      toggleFavorite: (stationId) =>
        set((state) => ({
          favorites: state.favorites.includes(stationId)
            ? state.favorites.filter((id) => id !== stationId)
            : [...state.favorites, stationId]
        })),
      refresh: async () => {
        set({ loading: true, globalError: null });
        try {
          const stations = await fetchAllStations();
          const lastUpdated = new Date().toISOString();
          set({ stations, lastUpdated, loading: false });
          await evaluateAlertRules(get().alertRules, stations, get().updateAlertRule);
        } catch (error) {
          set({
            loading: false,
            globalError: error instanceof Error ? error.message : 'Не удалось обновить данные.'
          });
        }
      },
      addAlertRule: (stationId, threshold) =>
        set((state) => ({
          alertRules: [
            ...state.alertRules,
            {
              id: crypto.randomUUID(),
              stationId,
              threshold,
              enabled: true
            }
          ]
        })),
      updateAlertRule: (rule) =>
        set((state) => ({
          alertRules: state.alertRules.map((item) => (item.id === rule.id ? rule : item))
        })),
      removeAlertRule: (ruleId) =>
        set((state) => ({ alertRules: state.alertRules.filter((rule) => rule.id !== ruleId) })),
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings }
        }))
    }),
    {
      name: 'wind-eysk-state',
      partialize: (state) => ({
        activeStationId: state.activeStationId,
        favorites: state.favorites,
        alertRules: state.alertRules,
        settings: state.settings
      })
    }
  )
);
