import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Database, ref, push } from '@angular/fire/database';
import { ImageUploadService } from '../services/image-upload';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage {
  info_title = '';
  info_description = '';
  product_price: number | null = null;
  product_stock: number | null = null;
  product_category = '';
  product_image = '';

  categories = ['Labios', 'Ojos', 'Rostro', 'Uñas', 'Cuidado'];

  uploading = false;
  saving = false;

  constructor(
    private router: Router,
    private database: Database,
    private toastCtrl: ToastController,
    private imageUpload: ImageUploadService,
    private cdr: ChangeDetectorRef
  ) {}

  // La página se reutiliza: limpiamos el formulario cada vez que se abre
  ionViewWillEnter() {
    this.info_title = '';
    this.info_description = '';
    this.product_price = null;
    this.product_stock = null;
    this.product_category = '';
    this.product_image = '';
    this.uploading = false;
    this.saving = false;
  }

  selectCategory(c: string) {
    this.product_category = this.product_category === c ? '' : c;
  }

  async onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;
    try {
      this.product_image = await this.imageUpload.upload(file);
    } catch (error: any) {
      await this.showToast(error?.message || 'No se pudo procesar la imagen', 'warning');
    } finally {
      this.uploading = false;
      input.value = ''; // permite volver a elegir el mismo archivo
      this.cdr.detectChanges();
    }
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
      product_image: this.product_image
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
      await push(ref(this.database, 'infos/'), data);
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