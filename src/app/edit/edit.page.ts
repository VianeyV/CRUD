import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Database, ref, get, update } from '@angular/fire/database';
import { ImageUploadService } from '../services/image-upload';
import { GalleryService } from '../services/gallery';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: false,
})
export class EditPage {
  readonly MAX_IMAGES = 5;

  productId = '';
  loaded = false;

  info_title = '';
  info_description = '';
  product_price: number | null = null;
  product_stock: number | null = null;
  product_category = '';
  images: string[] = []; // la primera es la portada

  categories = ['Labios', 'Ojos', 'Rostro', 'Uñas', 'Cuidado'];

  uploading = false;
  saving = false;

  // Si la galería no se pudo leer, no se toca al guardar (evita borrarla por error)
  private galleryLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private database: Database,
    private toastCtrl: ToastController,
    private imageUpload: ImageUploadService,
    private gallery: GalleryService,
    private cdr: ChangeDetectorRef
  ) {}

  ionViewWillEnter() {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    this.loaded = false;
    this.galleryLoaded = false;

    if (!this.productId) {
      this.router.navigate(['/home']);
      return;
    }
    this.loadProductData(this.productId);
  }

  async loadProductData(id: string) {
    try {
      const snapshot = await get(ref(this.database, 'infos/' + id));

      if (!snapshot.exists()) {
        await this.showToast('Ese producto ya no existe.', 'warning');
        this.router.navigate(['/home']);
        return;
      }

      const data = snapshot.val();
      this.info_title = data.info_title || '';
      this.info_description = data.info_description || '';
      this.product_price = data.product_price ?? null;
      this.product_stock = data.product_stock ?? null;
      this.product_category = data.product_category || '';

      let extras: string[] = [];
      try {
        extras = await this.gallery.load(id);
        this.galleryLoaded = true;
      } catch (error) {
        console.error('No se pudo cargar la galería:', error);
        await this.showToast('No se pudieron cargar las imágenes adicionales.', 'warning');
      }

      this.images = [data.product_image, ...extras].filter(Boolean);
      this.loaded = true;
    } catch (error) {
      console.error('Error al cargar el producto:', error);
      await this.showToast('No se pudo cargar el producto.', 'danger');
      this.router.navigate(['/home']);
    } finally {
      this.cdr.detectChanges();
    }
  }

  selectCategory(c: string) {
    this.product_category = this.product_category === c ? '' : c;
  }

  async onFilesSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const room = this.MAX_IMAGES - this.images.length;
    if (room <= 0) {
      input.value = '';
      await this.showToast(`Máximo ${this.MAX_IMAGES} imágenes por producto.`, 'warning');
      return;
    }
    if (files.length > room) {
      await this.showToast(`Solo caben ${room} imagen(es) más; se añadirán las primeras.`, 'warning');
    }

    this.uploading = true;
    try {
      for (const file of files.slice(0, room)) {
        this.images.push(await this.imageUpload.upload(file));
        this.cdr.detectChanges();
      }
    } catch (error: any) {
      await this.showToast(error?.message || 'No se pudo procesar la imagen', 'warning');
    } finally {
      this.uploading = false;
      input.value = '';
      this.cdr.detectChanges();
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  makeCover(index: number) {
    if (index === 0) return;
    const [img] = this.images.splice(index, 1);
    this.images.unshift(img);
  }

  async updateProduct() {
    const price = Number(this.product_price);

    if (!this.info_title.trim() || !(price > 0)) {
      await this.showToast('Ingresa al menos el nombre y un precio mayor a 0.', 'warning');
      return;
    }
    if (this.uploading) {
      await this.showToast('Espera a que termine de procesarse la imagen.', 'warning');
      return;
    }

    // Stock vacío = sin límite (null elimina el campo en Firebase)
    const stockRaw: any = this.product_stock;
    let stock: number | null = null;
    if (stockRaw !== null && stockRaw !== undefined && stockRaw !== '') {
      const n = Math.floor(Number(stockRaw));
      if (!isNaN(n)) stock = Math.max(0, n);
    }

    const data: any = {
      info_title: this.info_title.trim(),
      info_description: this.info_description.trim(),
      product_price: price,
      product_image: this.images[0] || '',
      product_category: this.product_category || null,
      product_stock: stock
    };

    this.saving = true;
    try {
      await update(ref(this.database, 'infos/' + this.productId), data);

      if (this.galleryLoaded) {
        try {
          await this.gallery.save(this.productId, this.images.slice(1));
        } catch (error) {
          console.error('Error al guardar la galería:', error);
          await this.showToast('Producto guardado, pero no se pudieron guardar las imágenes adicionales.', 'warning');
          this.router.navigate(['/home']);
          return;
        }
      }

      await this.showToast('Cambios guardados ✨', 'success');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al actualizar:', error);
      await this.showToast('No se pudo guardar. ¿Tienes permisos de administrador?', 'danger');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}