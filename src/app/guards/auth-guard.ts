import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Escuchamos el primer estado real de Firebase Auth antes de tomar una decisión
  return authState(auth).pipe(
    take(1),
    map(user => {
      if (user) {
        return true; // Permitir el paso si hay usuario activo en Firebase
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};