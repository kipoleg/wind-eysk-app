const DIRECTION_LABELS = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
const DIRECTION_ARROWS = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];

export function directionFromDegrees(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return '—';
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return DIRECTION_LABELS[index];
}

export function arrowFromDegrees(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return '•';
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return DIRECTION_ARROWS[index];
}

export function degreesFromDirection(label: string | null | undefined): number | null {
  if (!label) return null;
  const normalized = label.trim().toUpperCase().replace('C', 'С').replace('B', 'В').replace('ЮЗЗ', 'ЮЗ');
  const map: Record<string, number> = {
    N: 0,
    NORTH: 0,
    С: 0,
    СЕВЕР: 0,
    NE: 45,
    СВ: 45,
    СЕВЕРОВОСТОК: 45,
    E: 90,
    В: 90,
    ВОСТОК: 90,
    SE: 135,
    ЮВ: 135,
    S: 180,
    Ю: 180,
    ЮГ: 180,
    SW: 225,
    ЮЗ: 225,
    W: 270,
    З: 270,
    ЗАПАД: 270,
    NW: 315,
    СЗ: 315
  };
  return map[normalized] ?? null;
}
