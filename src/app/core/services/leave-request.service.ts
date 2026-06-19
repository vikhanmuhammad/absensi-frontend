import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { JenisCuti, LeaveRequest } from '../models/entities';

export interface CreateLeaveRequestInput {
  jenisCuti: JenisCuti;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  dokumenPendukungUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class LeaveRequestService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/leave-requests`;

  listMine(employeeId?: number) {
    const params: Record<string, string | number> = {};
    if (employeeId) params['employeeId'] = employeeId;

    return this.http
      .get<ApiEnvelope<LeaveRequest[]>>(`${this.base}/me`, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }

  listPending() {
    return this.http
      .get<ApiEnvelope<LeaveRequest[]>>(`${this.base}/pending`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  create(input: CreateLeaveRequestInput) {
    return this.http
      .post<ApiEnvelope<LeaveRequest>>(this.base, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  approve(id: number, catatan?: string) {
    return this.http
      .patch<ApiEnvelope<LeaveRequest>>(`${this.base}/${id}/approve`, { catatan }, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  reject(id: number, catatan?: string) {
    return this.http
      .patch<ApiEnvelope<LeaveRequest>>(`${this.base}/${id}/reject`, { catatan }, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
