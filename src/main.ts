import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app/app.component';
import { LoginPage } from './app/login/login.page';
import { authGuard } from './app/guards/auth-guard';

// Firebase Modules
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from './environments/environment';

// Ionicons
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  addOutline,
  lockClosedOutline,
  personAddOutline,
  closeOutline,
  mailUnreadOutline,
  createOutline,
  trashOutline,
  searchOutline,
  heartOutline,
  bagAddOutline,
  sparklesOutline,
  cartOutline,
  removeOutline,
  bagHandleOutline,
  arrowBackOutline, cubeOutline
} from 'ionicons/icons';

// Registro único y global de todos los iconos
addIcons({
  'log-out-outline': logOutOutline,
  'add-outline': addOutline,
  'lock-closed-outline': lockClosedOutline,
  'person-add-outline': personAddOutline,
  'close-outline': closeOutline,
  'mail-unread-outline': mailUnreadOutline,
  'create-outline': createOutline,
  'trash-outline': trashOutline,
  'search-outline': searchOutline,
  'heart-outline': heartOutline,
  'bag-add-outline': bagAddOutline,
  'sparkles-outline': sparklesOutline,
  'cart-outline': cartOutline,
  'remove-outline': removeOutline,
  'bag-handle-outline': bagHandleOutline,
  'arrow-back-outline': arrowBackOutline,
  'cube-outline': cubeOutline
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter([
      { path: '', component: LoginPage },
      { path: 'login', component: LoginPage },
      {
        path: 'home',
        loadChildren: () => import('./app/home/home.module').then(m => m.HomePageModule),
        canActivate: [authGuard]
      },
      {
        path: 'create',
        loadChildren: () => import('./app/create/create.module').then(m => m.CreatePageModule),
        canActivate: [authGuard]
      },
      {
        path: 'detail',
        loadChildren: () => import('./app/detail/detail.module').then(m => m.DetailPageModule),
        canActivate: [authGuard]
      },
      {
        path: 'edit',
        loadChildren: () => import('./app/edit/edit.module').then(m => m.EditPageModule),
        canActivate: [authGuard]
      },
      {
        path: 'cart',
        loadChildren: () => import('./app/cart/cart.module').then(m => m.CartPageModule),
        canActivate: [authGuard]
      }
    ], withPreloading(PreloadAllModules)),
    importProvidersFrom(ReactiveFormsModule),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase())
  ]
}).catch(err => console.error(err));