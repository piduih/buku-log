import { useCallback, useState } from 'react';

// Minimal IndexedDB wrapper to store structured-clone-able handles
const DB_NAME = 'buku-log-pak-long-fs';
const STORE_NAME = 'file-handles';

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putHandle(key: string, handle: any) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getHandle(key: string) {
  const db = await openDB();
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function removeHandle(key: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useFileSystemStorage() {
  const [fileHandle, setFileHandle] = useState<any | null>(null);

  const isSupported = typeof (window as any).showOpenFilePicker === 'function' && typeof (window as any).showSaveFilePicker === 'function';

  const attachFile = useCallback(async () => {
    if (!isSupported) return null;
    try {
      const [handle] = await (window as any).showOpenFilePicker({ types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }], multiple: false });
      if (handle) {
        await putHandle('buku-json-handle', handle);
        setFileHandle(handle);
        return handle;
      }
    } catch (e) {
      console.warn('attach cancelled', e);
    }
    return null;
  }, [isSupported]);

  const detach = useCallback(async () => {
    await removeHandle('buku-json-handle');
    setFileHandle(null);
  }, []);

  const loadFromPicker = useCallback(async () => {
    if (!isSupported) return null;
    try {
      const [handle] = await (window as any).showOpenFilePicker({ types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }], multiple: false });
      const file = await handle.getFile();
      const text = await file.text();
      await putHandle('buku-json-handle', handle);
      setFileHandle(handle);
      return JSON.parse(text);
    } catch (e) {
      console.warn('open cancelled or failed', e);
      return null;
    }
  }, [isSupported]);

  const tryLoadSavedHandle = useCallback(async () => {
    if (!isSupported) return null;
    try {
      const h = await getHandle('buku-json-handle');
      if (h) setFileHandle(h);
      return h;
    } catch (e) {
      console.warn('failed to get saved handle', e);
      return null;
    }
  }, [isSupported]);

  const saveToFile = useCallback(async (data: object, handle?: any) => {
    if (!isSupported) return false;
    try {
      let h = handle || fileHandle;
      if (!h) {
        h = await (window as any).showSaveFilePicker({ suggestedName: `buku-log-${new Date().toISOString().split('T')[0]}.json`, types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }] });
        if (!h) return false;
        await putHandle('buku-json-handle', h);
        setFileHandle(h);
      }
      const writable = await h.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      return true;
    } catch (e) {
      console.error('saveToFile failed', e);
      return false;
    }
  }, [isSupported, fileHandle]);

  return { isSupported, attachFile, detach, loadFromPicker, saveToFile, tryLoadSavedHandle, fileHandle };
}
