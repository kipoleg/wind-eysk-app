import type { CachedPayload } from '../types/weather';

const DB_NAME = 'wind-eysk-cache';
const DB_VERSION = 1;
const STORE_NAME = 'weather';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCache<T>(key: string, payload: T): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      key,
      payload,
      updatedAt: new Date().toISOString()
    } satisfies CachedPayload<T>);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function readCache<T>(key: string): Promise<CachedPayload<T> | null> {
  const db = await openDb();
  const result = await new Promise<CachedPayload<T> | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve((request.result as CachedPayload<T>) ?? null);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}
