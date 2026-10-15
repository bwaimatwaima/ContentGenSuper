/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


interface StoredAsset {
  id: string;
  type: 'image' | 'audio' | 'video';
  blob: Blob;
  metadata: {
    timestamp: number;
    size: number;
    mimeType: string;
    projectId?: string;
  };
}

class AssetStorage {
  private dbName = 'contentgen_assets';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('assets')) {
          const store = db.createObjectStore('assets', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
          store.createIndex('projectId', 'metadata.projectId', { unique: false });
        }
      };
    });
  }

  async storeAsset(blob: Blob, type: 'image' | 'audio' | 'video', projectId?: string, forceId?: string): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');
    
    const id = forceId || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const asset: StoredAsset = {
      id,
      type,
      blob,
      metadata: {
        timestamp: Date.now(),
        size: blob.size,
        mimeType: blob.type,
        projectId
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.put(asset);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getAsset(id: string): Promise<Blob | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Try local first for speed
    try {
      const localBlob = await new Promise<Blob | null>((resolve, reject) => {
        const transaction = this.db!.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const request = store.get(id);
        
        request.onsuccess = () => {
          const asset = request.result as StoredAsset | undefined;
          resolve(asset?.blob || null);
        };
        request.onerror = () => reject(request.error);
      });

      if (localBlob) return localBlob;
    } catch (e) {
      console.warn("Local asset get failed", e);
    }

    return null;
  }

  async deleteAsset(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearProjectAssets(projectId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const index = store.index('projectId');
      const request = index.openCursor(IDBKeyRange.only(projectId));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Cleanup old assets (older than 7 days, not in a project)
  async cleanupOrphanedAssets(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assets'], 'readwrite');
      const store = transaction.objectStore('assets');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffTime));
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const asset = cursor.value as StoredAsset;
          if (!asset.metadata.projectId) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const assetStorage = new AssetStorage();