import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Role } from '../services/auth.service';

export function roleGuard(allowedRoles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const role = auth.currentUser()?.role;
    if (role && allowedRoles.includes(role)) return true;

    // '/absensi' dipilih sebagai fallback karena bisa diakses semua role (lihat NAV_ITEMS di AppShellComponent).
    router.navigateByUrl('/absensi');
    return false;
  };
}
