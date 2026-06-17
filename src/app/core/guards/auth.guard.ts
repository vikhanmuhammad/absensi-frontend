import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn) return true;

  // Saat reload halaman, signal currentUser kosong tapi cookie sesi mungkin masih valid — cek ke /auth/me dulu.
  return auth.fetchMe().pipe(
    map(() => true),
    catchError(() => {
      router.navigateByUrl('/login');
      return of(false);
    }),
  );
};
