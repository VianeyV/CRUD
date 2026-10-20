import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly MAX_SIZE = 500;   // lado más largo, en píxeles
  private readonly QUALITY = 0.65;   // calidad JPEG (0 a 1)

  /** Devuelve la imagen reducida como "data:image/jpeg;base64,..." */
  async upload(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo no es una imagen');
    }

    let bitmap: ImageBitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error('No se pudo leer la imagen. Prueba con un JPG o PNG.');
    }

    const scale = Math.min(1, this.MAX_SIZE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    return canvas.toDataURL('image/jpeg', this.QUALITY);
  }
}