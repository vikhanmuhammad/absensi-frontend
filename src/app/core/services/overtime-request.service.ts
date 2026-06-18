import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { OvertimeRequest } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class OvertimeRequestService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/overtime-requests`;

  listMine() {
    return this.http
      .get<ApiEnvelope<OvertimeRequest[]>>(`${this.base}/me`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  create(input: { tanggal: string; deskripsiAlasan: string }) {
    return this.http
      .post<ApiEnvelope<OvertimeRequest>>(this.base, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  bulk(input: { employeeIds: string[]; tanggal: string; deskripsiAlasan: string }) {
    return this.http
      .post<ApiEnvelope<OvertimeRequest>>(`${this.base}/bulk`, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
