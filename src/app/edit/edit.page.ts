import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Database, ref, get, update } from '@angular/fire/database';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: false,
})
export class EditPage implements OnInit {
  productId: string = '';
  info_title: string = '';
  info_description: string = '';
  product_price: number | null = null;
  product_image: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private database: Database
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.loadProductData(this.productId);
    }
  }

  loadProductData(id: string) {
    const productRef = ref(this.database, 'infos/' + id);
    get(productRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.info_title = data.info_title;
        this.info_description = data.info_description;
        this.product_price = data.product_price || null;
        this.product_image = data.product_image || '';
      }
    }).catch((error) => {
      console.error('Error al cargar el producto:', error);
    });
  }

  updateProduct() {
    if (!this.info_title.trim() || !this.product_price) {
      alert('Por favor, completa el nombre y el precio.');
      return;
    }

    const productRef = ref(this.database, 'infos/' + this.productId);
    update(productRef, {
      info_title: this.info_title,
      info_description: this.info_description,
      product_price: this.product_price,
      product_image: this.product_image
    })
    .then(() => {
      this.router.navigate(['/home']);
    })
    .catch((error) => {
      console.error('Error al actualizar:', error);
    });
  }
}