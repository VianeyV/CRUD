import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { DetailPageRoutingModule } from './detail-routing.module';

import { DetailPage } from './detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailPageRoutingModule
  ],
  declarations: [DetailPage]
})
export class DetailPageModule {}
