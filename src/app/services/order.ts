import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Database, ref, push, set } from '@angular/fire/database';
import { CartItem } from './cart';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private db = inject(Database);
  private auth = inject(Auth);

  async createOrder(items: CartItem[], total: number): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No autenticado');

    const orderRef = push(ref(this.db, 'orders'));
    await set(orderRef, {
      uid: user.uid,
      email: user.email,
      items: items.map(i => ({ id: i.id, title: i.title, price: i.price, qty: i.qty })),
      total,
      status: 'pendiente_pago',
      createdAt: Date.now()
    });
    return orderRef.key as string;
  }
}