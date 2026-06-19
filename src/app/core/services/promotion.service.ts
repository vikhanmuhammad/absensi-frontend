import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { Employee, EmployeePromotion, JenisPromosi, SatuanUpah } from '../models/entities';

export interface CreatePromotionInput {
  employeeIds: number[];
  jenisPromosi: JenisPromosi;
  nominalUpahBaru: number;
  satuanUpahBaru: SatuanUpah;
  nominalUpahLemburBaru: number;
  pengaliLemburBaru?: number | null;
  tanggalMulai: string;
  tanggalSelesai?: string | null;
}

export interface CreatePromotionResponse {
  results: { employeeId: number; ok: boolean; message?: string; promotionId?: number }[];
  berhasil: number;
  dilewati: number;
}

@Injectable({ providedIn: 'root' })
export class PromotionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/promotions`;

  list(employeeId?: number) {
    const params: Record<string, number> = {};
    if (employeeId) params['employeeId'] = employeeId;
    return this.http
      .get<ApiEnvelope<EmployeePromotion[]>>(this.base, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }

  eligible(jenis: JenisPromosi) {
    return this.http
      .get<ApiEnvelope<Employee[]>>(`${this.base}/eligible`, { params: { jenis }, withCredentials: true })
      .pipe(map((res) => res.data));
  }

  create(input: CreatePromotionInput) {
    return this.http
      .post<ApiEnvelope<CreatePromotionResponse>>(this.base, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
