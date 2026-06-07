import axios from 'axios';
import { STATIONS } from '../data/stations';
import type { ForecastDay, Station, StationWeather, WeatherPoint } from '../types/weather';
import { readCache, saveCache } from './idb';
import { degreesFromDirection, directionFromDegrees } from '../utils/wind';

const REMOTE_BASE = 'https://wind.sintez.info';
const DEV_BASE = '/wind-api';
const BASE_URL = import.meta.env.DEV ? DEV_BASE : REMOTE_BASE;

const HISTORY_CACHE = 'history';
const TODAY_CACHE = 'forecast-today';
const TOMORROW_CACHE = 'forecast-tomorrow';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 18_000,
  responseType: 'text',
  transformResponse: [(data) => data]
});

type PayloadSource = {
  payload: unknown;
  updatedAt: string;
  fromCache: boolean;
};

type RecordContext = {
  stationId?: string;
  stationName?: string;
};

async function fetchWithCache<T>(key: string, path: string): Promise<PayloadSource> {
  try {
    const response = await api.get<T | string>(path);
    const payload = parseMaybeJson(response.data);
    await saveCache(key, payload);
    return {
      payload,
      updatedAt: new Date().toISOString(),
      fromCache: false
    };
  } catch (error) {
    const cached = await readCache<unknown>(key);
    if (cached) {
      return {
        payload: cached.payload,
        updatedAt: cached.updatedAt,
        fromCache: true
      };
    }
    throw error;
  }
}

async function fetchHistoryWithCache(station: Station): Promise<PayloadSource> {
  const key = `${HISTORY_CACHE}:${station.id}`;
  const primary = await fetchWithCache(key, `/history/history.php?id=${station.id}`);
  if (hasStationRequiredError(primary.payload)) {
    return fetchWithCache(key, `/history/history.php?station=${station.id}`);
  }
  return primary;
}

export async function fetchStationWeather(station: Station): Promise<StationWeather> {
  const [historyResult, todayResult, tomorrowResult] = await Promise.allSettled([
    fetchHistoryWithCache(station),
    fetchWithCache(TODAY_CACHE, '/wind_analysis.json'),
    fetchWithCache(TOMORROW_CACHE, '/wind_analysis_tomorrow.json')
  ]);

  const historySource = unwrapSource(historyResult);
  const todaySource = unwrapSource(todayResult);
  const tomorrowSource = unwrapSource(tomorrowResult);

  const history = historySource ? normalizePayload(historySource.payload, station, 'today', 'history') : [];
  const today = todaySource ? normalizePayload(todaySource.payload, station, 'today', 'forecast') : [];
  const tomorrow = tomorrowSource ? normalizePayload(tomorrowSource.payload, station, 'tomorrow', 'forecast') : [];
  const current = pickCurrent(history, today);
  const sources = [historySource, todaySource, tomorrowSource].filter(Boolean) as PayloadSource[];
  const lastUpdated = newestTimestamp(sources.map((source) => source.updatedAt));

  return {
    station,
    current,
    history,
    today,
    tomorrow,
    lastUpdated,
    fromCache: sources.some((source) => source.fromCache),
    error: buildError([historyResult, todayResult, tomorrowResult])
  };
}

export async function fetchAllStations(): Promise<Record<string, StationWeather>> {
  const entries = await Promise.all(STATIONS.map(async (station) => [station.id, await fetchStationWeather(station)] as const));
  return Object.fromEntries(entries);
}

function unwrapSource(result: PromiseSettledResult<PayloadSource>): PayloadSource | null {
  return result.status === 'fulfilled' ? result.value : null;
}

function buildError(results: PromiseSettledResult<PayloadSource>[]): string | null {
  if (results.some((result) => result.status === 'fulfilled')) return null;
  const rejected = results.find((result): result is PromiseRejectedResult => result.status === 'rejected');
  const reason = rejected?.reason;
  if (reason instanceof Error) return reason.message;
  return 'Не удалось загрузить данные и кеш пока пуст.';
}

function parseMaybeJson(payload: unknown): unknown {
  if (typeof payload !== 'string') return payload;
  const trimmed = payload.trim();
  if (!trimmed) return payload;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return payload;
    }
  }
  return payload;
}

function hasStationRequiredError(payload: unknown): boolean {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      String((payload as { error?: unknown }).error).toLowerCase().includes('station')
  );
}

function normalizePayload(
  payload: unknown,
  station: Station,
  day: ForecastDay,
  source: 'history' | 'forecast'
): WeatherPoint[] {
  if (source === 'forecast') {
    const forecastPoints = normalizeForecastArrays(payload, station, day);
    if (forecastPoints.length) return forecastPoints;
  }

  if (typeof payload === 'string' && payload.includes('<')) {
    return parseHtmlHistory(payload, station);
  }

  const records = collectRecords(payload, {});
  const stationRecords = records.filter(({ context, value }) => recordMatchesStation(value, context, station));
  return stationRecords
    .map(({ value }, index) => normalizeRecord(value, station, day, source, index))
    .filter((point): point is WeatherPoint => point !== null)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

function collectRecords(payload: unknown, context: RecordContext): Array<{ value: Record<string, unknown>; context: RecordContext }> {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => collectRecords(item, context));
  }
  if (!payload || typeof payload !== 'object') return [];

  const object = payload as Record<string, unknown>;
  if (looksLikeWeatherRecord(object)) {
    return [{ value: object, context }];
  }

  return Object.entries(object).flatMap(([key, value]) => {
    const nextContext = { ...context };
    const stationById = STATIONS.find((station) => station.id === key);
    const stationByName = STATIONS.find((station) => station.name.toLowerCase() === key.toLowerCase());
    if (stationById) nextContext.stationId = stationById.id;
    if (stationByName) {
      nextContext.stationId = stationByName.id;
      nextContext.stationName = stationByName.name;
    }
    return collectRecords(value, nextContext);
  });
}

function looksLikeWeatherRecord(record: Record<string, unknown>): boolean {
  const keys = Object.keys(record).map((key) => key.toLowerCase());
  return keys.some((key) => /(time|date|hour|время|дата|час)/.test(key)) &&
    keys.some((key) => /(wind|вет|скор|gust|порыв|temp|темп)/.test(key));
}

function recordMatchesStation(record: Record<string, unknown>, context: RecordContext, station: Station): boolean {
  if (context.stationId && context.stationId !== station.id) return false;
  const rawId = pickText(record, ['id', 'station_id', 'stationId', 'code', 'код']);
  const rawName = pickText(record, ['station', 'station_name', 'name', 'место', 'станция']);
  if (rawId && rawId.padStart(4, '0') !== station.id) return false;
  if (rawName && !rawName.toLowerCase().includes(station.name.toLowerCase())) return false;
  return true;
}

function normalizeRecord(
  record: Record<string, unknown>,
  station: Station,
  day: ForecastDay,
  source: 'history' | 'forecast',
  index: number
): WeatherPoint | null {
  const time = normalizeTime(
    pickText(record, ['time', 'datetime', 'date_time', 'date', 'hour', 'forecast_time', 'время', 'дата', 'час']),
    day,
    index
  );
  if (!time) return null;

  const directionText = pickText(record, ['direction', 'wind_direction', 'dir', 'rumb', 'направление', 'напр']);
  const directionDeg = pickNumber(record, ['direction_deg', 'wind_dir_deg', 'deg', 'градусы']) ?? degreesFromDirection(directionText);
  const avgWind = pickNumber(record, ['avgWind', 'wind', 'wind_speed', 'speed', 'mean', 'average', 'ветер', 'скорость']);

  return {
    id: `${source}-${station.id}-${time}-${index}`,
    stationId: station.id,
    time,
    label: labelFromTime(time),
    avgWind,
    gust: pickNumber(record, ['gust', 'gusts', 'wind_gust', 'maxWind', 'порыв', 'порывы', 'макс']),
    minWind: pickNumber(record, ['minWind', 'min', 'wind_min', 'мин']),
    forecastWind: source === 'forecast' ? avgWind : null,
    temp: pickNumber(record, ['temp', 'temperature', 'air_temp', 't', 'температура']),
    directionDeg,
    directionLabel: directionText || directionFromDegrees(directionDeg),
    pressure: pickNumber(record, ['pressure', 'press', 'давление']),
    humidity: pickNumber(record, ['humidity', 'hum', 'влажность']),
    cloudiness: pickNumber(record, ['cloudiness', 'clouds', 'cloud', 'облачность']),
    precipitation: pickNumber(record, ['precipitation', 'precip', 'rain', 'осадки']),
    waterTemp: pickNumber(record, ['waterTemp', 'water_temp', 'waterTemperature', 'температура воды']),
    uvIndex: pickNumber(record, ['uv', 'uvIndex', 'uv_index', 'уф', 'uv индекс'])
  };
}

function parseHtmlHistory(html: string, station: Station): WeatherPoint[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = Array.from(doc.querySelectorAll('tr'));
  const header = rows[0]
    ? Array.from(rows[0].querySelectorAll('th,td')).map((cell) => cleanText(cell.textContent))
    : [];

  return rows.slice(1).map((row, index) => {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => cleanText(cell.textContent));
    if (cells.length < 2) return null;
    const record = cellsToRecord(header, cells);
    return normalizeRecord(record, station, 'today', 'history', index);
  }).filter((point): point is WeatherPoint => point !== null);
}

function cellsToRecord(header: string[], cells: string[]): Record<string, string> {
  if (header.length === cells.length && header.some(Boolean)) {
    return Object.fromEntries(header.map((key, index) => [key, cells[index]]));
  }
  return {
    time: cells[0],
    wind: cells[1],
    gust: cells[2],
    min: cells[3],
    temp: cells[4],
    direction: cells[5],
    pressure: cells[6],
    humidity: cells[7],
    cloudiness: cells[8],
    precipitation: cells[9],
    waterTemp: cells[10],
    uv: cells[11]
  };
}

function pickCurrent(history: WeatherPoint[], today: WeatherPoint[]): WeatherPoint | null {
  const now = Date.now();
  const candidates = [...history, ...today].filter((point) => new Date(point.time).getTime() <= now + 10 * 60 * 1000);
  return candidates.at(-1) ?? history.at(-1) ?? today[0] ?? null;
}

function newestTimestamp(values: string[]): string | null {
  if (!values.length) return null;
  return values.reduce((newest, value) => (new Date(value).getTime() > new Date(newest).getTime() ? value : newest));
}

function normalizeTime(value: string | null, day: ForecastDay, index: number): string | null {
  if (!value) {
    const date = new Date();
    if (day === 'tomorrow') date.setDate(date.getDate() + 1);
    date.setHours(index, 0, 0, 0);
    return date.toISOString();
  }

  const cleaned = value.replace(/\s+/g, ' ').trim();
  const direct = new Date(cleaned);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();

  const timeMatch = cleaned.match(/(\d{1,2})[:.](\d{2})/);
  const date = new Date();
  if (day === 'tomorrow') date.setDate(date.getDate() + 1);
  if (timeMatch) {
    date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
    return date.toISOString();
  }

  const ruDate = cleaned.match(/(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/);
  if (ruDate) {
    date.setMonth(Number(ruDate[2]) - 1, Number(ruDate[1]));
    if (ruDate[3]) date.setFullYear(Number(ruDate[3].padStart(4, '20')));
    return date.toISOString();
  }
  return null;
}

function labelFromTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number | null {
  const value = pickValue(record, keys);
  return numberFrom(value);
}

function pickText(record: Record<string, unknown>, keys: string[]): string | null {
  const value = pickValue(record, keys);
  if (value === null || value === undefined) return null;
  return cleanText(String(value));
}

function pickValue(record: Record<string, unknown>, keys: string[]): unknown {
  const normalizedKeys = keys.map(normalizeKey);
  for (const [key, value] of Object.entries(record)) {
    const normalized = normalizeKey(key);
    if (normalizedKeys.some((candidate) => keyMatches(normalized, candidate))) {
      return value;
    }
  }
  return null;
}

function keyMatches(normalized: string, candidate: string): boolean {
  if (normalized === candidate) return true;
  if (candidate.length <= 2 || normalized.length <= 2) return false;
  return normalized.includes(candidate) || candidate.includes(normalized);
}

function numberFrom(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined) return null;
  const match = String(value).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[\s_().:-]+/g, '');
}

function cleanText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}
