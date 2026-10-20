import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  qty: number;
  stock: number | null; // null = sin límite
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly KEY = 'cyberbeauty_cart';
  private items$ = new BehaviorSubject<CartItem[]>(this.load());

  readonly cart$ = this.items$.asObservable();
  readonly count$ = this.items$.pipe(map(i => i.reduce((s, x) => s + x.qty, 0)));
  readonly total$ = this.items$.pipe(map(i => i.reduce((s, x) => s + x.price * x.qty, 0)));

  get snapshot(): CartItem[] {
    return this.items$.value;
  }

  get total(): number {
    return this.snapshot.reduce((s, x) => s + x.price * x.qty, 0);
  }

  private parseStock(value: any): number | null {
    if (value === undefined || value === null || value === '') return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
  }

  isSoldOut(product: any): boolean {
    const stock = this.parseStock(product.product_stock);
    return stock !== null && stock <= 0;
  }

  /** Devuelve false si no hay más unidades disponibles */
  add(product: any): boolean {
    const stock = this.parseStock(product.product_stock);
    const items = this.items$.value.map(i => ({ ...i }));
    const found = items.find(i => i.id === product.id);
    const nextQty = (found?.qty ?? 0) + 1;

    if (stock !== null && nextQty > stock) return false;

    if (found) {
      found.qty = nextQty;
      found.stock = stock;
    } else {
      items.push({
        id: product.id,
        title: product.info_title,
        price: Number(product.product_price) || 0,
        image: product.product_image || FALLBACK_IMG,
        qty: 1,
        stock
      });
    }
    this.save(items);
    return true;
  }

  setQty(id: string, qty: number): boolean {
    if (qty < 1) return false;
    const items = this.items$.value.map(i => ({ ...i }));
    const item = items.find(i => i.id === id);
    if (!item) return false;
    if (item.stock !== null && qty > item.stock) return false;
    item.qty = qty;
    this.save(items);
    return true;
  }

  remove(id: string) {
    this.save(this.items$.value.filter(i => i.id !== id));
  }

  clear() {
    this.save([]);
  }

  private save(items: CartItem[]) {
    this.items$.next(items);
    try {
      localStorage.setItem(this.KEY, JSON.stringify(items));
    } catch {}
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '[]');
    } catch {
      return [];
    }
  }
}