
import { Component, ChangeDetectorRef } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Database, ref, onValue, remove } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth';
import { CartService } from '../services/cart';
import { GalleryService } from '../services/gallery';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  infos: any[] = [];
  userRole: string = 'user';

  // Buscador y categorias
  searchTerm = '';
  selectedCategory = 'Todos';
  categories = ['Todos', 'Labios', 'Ojos', 'Rostro', 'Uñas', 'Cuidado'];

  fallbackImg =
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop';

  private unsubscribe?: () => void;
  cartCount$: Observable<number>;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private database: Database,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private gallery: GalleryService
  ) {
    this.cartCount$ = this.cartService.count$;
  }

  async ionViewWillEnter() {
    this.userRole = await this.authService.getUserRole();
    this.loadData();
  }

  ionViewWillLeave() {
    // Evita listeners duplicados cada vez que vuelves al home
    this.unsubscribe?.();
  }

  loadData() {
    this.unsubscribe?.();
    const dbRef = ref(this.database, 'infos/');

    this.unsubscribe = onValue(dbRef, (snapshot) => {
      const tempArray: any[] = [];

      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val();

        tempArray.push({
          id: childSnapshot.key,
          info_title: val.info_title,
          info_description: val.info_description,
          product_image: val.product_image,
          product_price: val.product_price,
          product_category: val.product_category,
          product_stock: val.product_stock
        });
      });

      this.infos = tempArray;
      this.cdr.detectChanges();
    });
  }

  isSoldOut(item: any): boolean {
    return this.cartService.isSoldOut(item);
  }

  async addToCart(item: any, ev: Event) {
    ev.stopPropagation();

    const ok = this.cartService.add(item);

    const toast = await this.toastCtrl.create({
      message: ok
        ? `${item.info_title} agregado al carrito 🛍️`
        : 'No hay más unidades disponibles',
      duration: 1500,
      position: 'bottom',
      color: ok ? 'primary' : 'warning'
    });

    await toast.present();
  }

  get filteredInfos() {
    const term = this.searchTerm.toLowerCase().trim();

    return this.infos.filter((i) => {
      const matchText =
        !term ||
        i.info_title?.toLowerCase().includes(term) ||
        i.info_description?.toLowerCase().includes(term);

      const matchCat =
        this.selectedCategory === 'Todos' ||
        i.product_category === this.selectedCategory;

      return matchText && matchCat;
    });
  }

  onSearch(ev: Event) {
    this.searchTerm = (ev.target as HTMLInputElement).value;
  }

  selectCategory(c: string) {
    this.selectedCategory = c;
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = this.fallbackImg;
  }

  goToDetail(id: string) {
    this.router.navigate(['/detail', { id: id }]);
  }

  edit(id: string) {
    this.router.navigate(['/edit', { id: id }]);
  }

  async logout() {
    this.cartService.clear();
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  async delete(id: string) {
    if (this.userRole !== 'admin') {
      const alert = await this.alertController.create({
        header: 'Acceso denegado',
        message: 'No tienes permisos de administrador para borrar registros.',
        buttons: ['OK']
      });

      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: '¿Confirmar eliminación?',
      message: '¿Estás seguro de que deseas borrar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, borrar',
          handler: () => {
            remove(ref(this.database, 'infos/' + id)).catch((error) => {
              console.error(error);
            });

            this.gallery.clear(id).catch((error) => {
              console.error(error);
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
