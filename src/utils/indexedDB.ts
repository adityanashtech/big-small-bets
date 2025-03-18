
export interface TimerData {
  id: number;
  timeLeft: number;
  duration: number;
  lastUpdated: number;
  isRunning: boolean;
}

const DB_NAME = "BigSmallGameDB";
const STORE_NAME = "timers";
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(true);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject(false);
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const upgradeDB = (event.target as IDBOpenDBRequest).result;
      
      if (!upgradeDB.objectStoreNames.contains(STORE_NAME)) {
        upgradeDB.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const getTimer = (id: number): Promise<TimerData | null> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Database not initialized");
      return;
    }

    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = (event) => {
      console.error("Error getting timer:", event);
      reject(null);
    };
  });
};

export const saveTimer = (timerData: TimerData): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Database not initialized");
      return;
    }

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(timerData);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = (event) => {
      console.error("Error saving timer:", event);
      reject(false);
    };
  });
};

export const updateTimer = (id: number, updates: Partial<TimerData>): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentTimer = await getTimer(id);
      
      if (!currentTimer) {
        reject("Timer not found");
        return;
      }
      
      const updatedTimer = {
        ...currentTimer,
        ...updates
      };
      
      const success = await saveTimer(updatedTimer);
      resolve(success);
    } catch (error) {
      console.error("Error updating timer:", error);
      reject(false);
    }
  });
};
