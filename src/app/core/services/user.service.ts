import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { UserAccount } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  list() {
    return this.http.get<ApiEnvelope<UserAccount[]>>(this.base, { withCredentials: true }).pipe(map((res) => res.data));
  }

  setActive(id: number, statusAktif: boolean) {
    return this.http
      .patch<ApiEnvelope<UserAccount>>(`${this.base}/${id}`, { statusAktif }, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
