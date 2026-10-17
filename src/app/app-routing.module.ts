import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginPage } from './login/login.page';
import { authGuard } from './guards/auth-guard';

const routes: Routes = [
  {
    path: '',
    component: LoginPage // <--- Carga directa en la raíz sin redirecciones
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadChildren: () => import('./create/create.module').then(m => m.CreatePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'detail',
    loadChildren: () => import('./detail/detail.module').then(m => m.DetailPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'edit',
    loadChildren: () => import('./edit/edit.module').then(m => m.EditPageModule),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '' // <--- Comodín por si cualquier otra ruta falla
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      initialNavigation: 'enabledBlocking'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }