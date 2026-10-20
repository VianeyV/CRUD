import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../services/cart';
import { OrderService } from '../services/order';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false,
})
export class CartPage {
  cart$: Observable<CartItem[]>;
  total$: Observable<number>;
  processing = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.cart$ = this.cartService.cart$;
    this.total$ = this.cartService.total$;
  }

  async change(item: CartItem, delta: number) {
    const ok = this.cartService.setQty(item.id, item.qty + delta);
    if (!ok && delta > 0) {
      const toast = await this.toastCtrl.create({
        message: 'No hay más unidades disponibles',
        duration: 1500,
        color: 'warning'
      });
      await toast.present();
    }
  }

  remove(id: string) {
    this.cartService.remove(id);
  }

  async checkout() {
    const items = this.cartService.snapshot;
    if (!items.length) return;

    this.processing = true;
    try {
      const orderId = await this.orderService.createOrder(items, this.cartService.total);

      // TODO pasarela de pagos: aquí se iniciará el pago de `orderId`

      this.cartService.clear();
      const alert = await this.alertCtrl.create({
        header: '¡Pedido registrado! 💄',
        message: `Tu pedido quedó pendiente de pago. Código: ${orderId.slice(-6).toUpperCase()}`,
        buttons: ['OK']
      });
      await alert.present();
      this.router.navigate(['/home']);
    } catch (error) {
      console.error(error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'No pudimos registrar tu pedido. Inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.processing = false;
    }
  }
}