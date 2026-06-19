import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { AppNotification } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notifications`;

  unreadCount = signal(0);

  list() {
    return this.http.get<ApiEnvelope<AppNotification[]>>(this.base, { withCredentials: true }).pipe(
      map((res) => res.data),
      tap((items) => this.unreadCount.set(items.filter((n) => !n.sudahDibaca).length)),
    );
  }

  markAsRead(id: number) {
    return this.http
      .patch(`${this.base}/${id}/read`, {}, { withCredentials: true })
      .pipe(tap(() => this.unreadCount.update((n) => Math.max(0, n - 1))));
  }

  markAllAsRead() {
    return this.http
      .patch(`${this.base}/read-all`, {}, { withCredentials: true })
      .pipe(tap(() => this.unreadCount.set(0)));
  }
}
