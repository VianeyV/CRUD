import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Database, ref, push } from '@angular/fire/database';
import { ImageUploadService } from '../services/image-upload';
import { GalleryService } from '../services/gallery';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage {
  readonly MAX_IMAGES = 5;

  info_title = '';
  info_description = '';
  product_price: number | null = null;
  product_stock: number | null = null;
  product_category = '';
  images: string[] = []; // la primera es la portada

  categories = ['Labios', 'Ojos', 'Rostro', 'Uñas', 'Cuidado'];

  uploading = false;
  saving = false;

  constructor(
    private router: Router,
    private database: Database,
    private toastCtrl: ToastController,
    private imageUpload: ImageUploadService,
    private gallery: GalleryService,
    private cdr: ChangeDetectorRef
  ) {}

  // La página se reutiliza: limpiamos el formulario cada vez que se abre
  ionViewWillEnter() {
    this.info_title = '';
    this.info_description = '';
    this.product_price = null;
    this.product_stock = null;
    this.product_category = '';
    this.images = [];
    this.uploading = false;
    this.saving = false;
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

  async createProduct() {
    const price = Number(this.product_price);

    if (!this.info_title.trim() || !(price > 0)) {
      await this.showToast('Ingresa al menos el nombre y un precio mayor a 0.', 'warning');
      return;
    }
    if (this.uploading) {
      await this.showToast('Espera a que termine de procesarse la imagen.', 'warning');
      return;
    }

    const data: any = {
      info_title: this.info_title.trim(),
      info_description: this.info_description.trim(),
      product_price: price,
      product_image: this.images[0] || ''
    };

    if (this.product_category) {
      data.product_category = this.product_category;
    }

    // Stock vacío = sin límite (no se guarda el campo)
    const stockRaw: any = this.product_stock;
    if (stockRaw !== null && stockRaw !== undefined && stockRaw !== '') {
      const stock = Math.floor(Number(stockRaw));
      if (!isNaN(stock)) {
        data.product_stock = Math.max(0, stock);
      }
    }

    this.saving = true;
    try {
      const newRef = await push(ref(this.database, 'infos/'), data);

      const extras = this.images.slice(1);
      if (extras.length && newRef.key) {
        try {
          await this.gallery.save(newRef.key, extras);
        } catch (error) {
          console.error('Error al guardar la galería:', error);
          await this.showToast('Producto publicado, pero no se pudieron guardar las imágenes adicionales.', 'warning');
          this.router.navigate(['/home']);
          return;
        }
      }

      await this.showToast('Producto publicado ✨', 'success');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      await this.showToast('No se pudo guardar. ¿Tienes permisos de administrador?', 'danger');
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}