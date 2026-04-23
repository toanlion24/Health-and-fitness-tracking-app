import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "hf_offline_queue_v1";

export type OfflineQueueItem = {
  id: string;
  kind: string;
  payload: unknown;
  createdAt: string;
};

/**
 * Persists a lightweight outbox for actions taken while offline (MVP: store only).
 * A future sync worker can drain and replay these against the API.
 */
export async function enqueueOffline(item: {
  kind: string;
  payload: unknown;
}): Promise<void> {
  const prev = await readQueue();
  const next: OfflineQueueItem[] = [
    ...prev,
    {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      kind: item.kind,
      payload: item.payload,
      createdAt: new Date().toISOString(),
    },
  ];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function readQueue(): Promise<OfflineQueueItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as OfflineQueueItem[];
  } catch {
    return [];
  }
}

export async function clearOfflineQueue(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
