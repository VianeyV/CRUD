import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Database, ref, get } from '@angular/fire/database';
import { AuthService } from '../services/auth';
import { CartService } from '../services/cart';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailPage implements OnInit, OnDestroy {
  product: any = null;
  productId: string = '';
  userRole: string = 'user';

  private alive = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private database: Database,
    private authService: AuthService,
    private cartService: CartService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.productId) {
      this.router.navigate(['/home']);
      return;
    }

    // El producto se carga sin esperar al rol
    this.loadProductDetails(this.productId);

    const role = await this.authService.getUserRole();
    this.userRole = role;
    this.refresh();
  }

  ngOnDestroy() {
    this.alive = false;
  }

  // Repinta la vista, salvo que la página ya se haya cerrado
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
        this.refresh();
      } else {
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      this.router.navigate(['/home']);
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