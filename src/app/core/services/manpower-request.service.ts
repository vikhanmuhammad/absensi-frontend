import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { ManpowerMode, ManpowerRequest } from '../models/entities';

export interface CreateManpowerRequestInput {
  projectId: number;
  divisiAsalId: number;
  mode: ManpowerMode;
  employeeId?: number;
  jumlahDiminta?: number;
  kriteria?: string;
  tanggalMulaiPenugasan: string;
  tanggalAkhirPenugasan: string;
}

@Injectable({ providedIn: 'root' })
export class ManpowerRequestService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/manpower-requests`;

  listPending(divisiId?: number) {
    const params: Record<string, string | number> = {};
    if (divisiId) params['divisiId'] = divisiId;

    return this.http
      .get<ApiEnvelope<ManpowerRequest[]>>(`${this.base}/pending`, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }

  create(input: CreateManpowerRequestInput) {
    return this.http
      .post<ApiEnvelope<ManpowerRequest>>(this.base, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  approve(id: number, employeeId?: number) {
    return this.http
      .patch<ApiEnvelope<ManpowerRequest>>(`${this.base}/${id}/approve`, { employeeId }, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  reject(id: number, catatan?: string) {
    return this.http
      .patch<ApiEnvelope<ManpowerRequest>>(`${this.base}/${id}/reject`, { catatan }, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
