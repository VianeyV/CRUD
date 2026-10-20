import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Database, ref, get } from '@angular/fire/database';
import { AuthService } from '../services/auth';
import { CartService } from '../services/cart';
import { GalleryService } from '../services/gallery';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailPage implements OnInit, OnDestroy {
  @ViewChild('carousel') carousel?: ElementRef<HTMLElement>;

  product: any = null;
  productId: string = '';
  userRole: string = 'user';

  images: string[] = [];
  currentIndex = 0;

  fallbackImg =
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop';

  private alive = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private database: Database,
    private authService: AuthService,
    private cartService: CartService,
    private gallery: GalleryService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.productId) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadProductDetails(this.productId);

    const role = await this.authService.getUserRole();
    this.userRole = role;
    this.refresh();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  private refresh() {
    if (this.alive) {
      this.cdr.detectChanges();
    }
  }

  async loadProductDetails(id: string) {
    try {
      const snapshot = await get(ref(this.database, 'infos/' + id));

      if (snapshot.exists()) {
        this.product = { ...snapshot.val(), id };
        this.images = [this.product.product_image].filter(Boolean);
        this.refresh();
        this.loadExtraImages(id);
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      this.router.navigate(['/home']);
    }
  }

  // La galería se carga aparte para no retrasar la ficha del producto
  private async loadExtraImages(id: string) {
    try {
      const extras = await this.gallery.load(id);
      if (extras.length) {
        this.images = [...this.images, ...extras];
        this.refresh();
      }
    } catch (error) {
      console.warn('No se pudo cargar la galería:', error);
    }
  }

  get displayImages(): string[] {
    return this.images.length ? this.images : [this.fallbackImg];
  }

  onScroll(ev: Event) {
    const el = ev.target as HTMLElement;
    if (!el.clientWidth) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== this.currentIndex) {
      this.currentIndex = index;
      this.refresh();
    }
  }

  goTo(index: number) {
    const el = this.carousel?.nativeElement;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img.src !== this.fallbackImg) {
      img.src = this.fallbackImg;
    }
  }

  get isSoldOut(): boolean {
    return !!this.product && this.cartService.isSoldOut(this.product);
  }

  async addToCart() {
    const ok = this.cartService.add(this.product);
    const toast = await this.toastCtrl.create({
      message: ok
        ? `${this.product.info_title} agregado al carrito 🛍️`
        : 'No hay más unidades disponibles',
      duration: 1500,
      position: 'bottom',
      color: ok ? 'primary' : 'warning'
    });
    await toast.present();
  }

  goBack() {
    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/home']);
  }

  editProduct(id: string) {
    this.router.navigate(['/edit', { id: id }]);
  }
}