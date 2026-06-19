import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { Division } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class DivisionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/divisions`;

  list() {
    return this.http.get<ApiEnvelope<Division[]>>(this.base, { withCredentials: true }).pipe(map((res) => res.data));
  }

  getById(id: number) {
    return this.http
      .get<ApiEnvelope<Division>>(`${this.base}/${id}`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  create(data: { namaDivisi: string; supervisorEmployeeId?: number }) {
    return this.http
      .post<ApiEnvelope<Division>>(this.base, data, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  update(id: number, data: { namaDivisi?: string; supervisorEmployeeId?: number }) {
    return this.http
      .patch<ApiEnvelope<Division>>(`${this.base}/${id}`, data, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
