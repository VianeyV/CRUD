import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonIcon,
  IonFooter
} from '@ionic/angular';

import { CartPageRoutingModule } from './cart-routing.module';
import { CartPage } from './cart.page';

@NgModule({
  imports: [
    CommonModule,
    CartPageRoutingModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonIcon,
    IonFooter
  ],
  declarations: [CartPage]
})
export class CartPageModule {}