import { Injectable } from '@angular/core';
import { Database, ref, get, set, remove } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  constructor(private database: Database) {}

  /** Imágenes adicionales (sin la portada) de un producto */
  async load(productId: string): Promise<string[]> {
    const snapshot = await get(ref(this.database, 'galleries/' + productId));
    if (!snapshot.exists()) return [];

    const value = snapshot.val();
    const list = Array.isArray(value) ? value : Object.values(value);
    return (list as string[]).filter(Boolean);
  }

  async save(productId: string, images: string[]): Promise<void> {
    const nodeRef = ref(this.database, 'galleries/' + productId);
    if (images.length === 0) {
      await remove(nodeRef);
    } else {
      await set(nodeRef, images);
    }
  }

  async clear(productId: string): Promise<void> {
    await remove(ref(this.database, 'galleries/' + productId));
  }
}