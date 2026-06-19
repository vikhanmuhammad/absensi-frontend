import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'SUPER_ADMIN' | 'HRD' | 'SUPERVISOR' | 'KARYAWAN';

export interface CurrentUser {
  id: number;
  username: string;
  role: Role;
  superAdminType: 'DIREKTUR' | 'IT_MAINTENANCE' | null;
  employee: {
    id: number;
    namaLengkap: string;
    divisiId: number;
  } | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<CurrentUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  login(username: string, password: string) {
    return this.http
      .post<ApiEnvelope<CurrentUser>>(`${environment.apiUrl}/auth/login`, { username, password }, { withCredentials: true })
      .pipe(tap((res) => this.currentUser.set(res.data)));
  }

  logout() {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigateByUrl('/login');
      }),
    );
  }

  /** Mencoba memulihkan sesi dari cookie httpOnly (dipanggil authGuard saat reload halaman). */
  fetchMe() {
    return this.http
      .get<ApiEnvelope<CurrentUser>>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(tap((res) => this.currentUser.set(res.data)));
  }
}
