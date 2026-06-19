import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { Attendance, Employee, LokasiKerja } from '../models/entities';

export interface ClockInInput {
  namaProjekAktivitas: string;
  lokasiKerja: LokasiKerja;
  lokasiLainnyaDetail?: string;
  latitude?: number;
  longitude?: number;
}

export interface BulkAttendanceInput {
  employeeId: number;
  tanggal: string;
  jamMasuk: string;
  jamKeluar?: string;
  deskripsiInputMassal: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/attendance`;

  today() {
    return this.http
      .get<ApiEnvelope<Attendance | null>>(`${this.base}/today`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  history(filter: { employeeId?: number; divisiId?: number; startDate?: string; endDate?: string } = {}) {
    const params: Record<string, string | number> = {};
    if (filter.employeeId) params['employeeId'] = filter.employeeId;
    if (filter.divisiId) params['divisiId'] = filter.divisiId;
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;

    return this.http
      .get<ApiEnvelope<Attendance[]>>(this.base, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }

  clockIn(input: ClockInInput) {
    return this.http
      .post<ApiEnvelope<Attendance>>(`${this.base}/clock-in`, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  clockOut(input: { latitude?: number; longitude?: number } = {}) {
    return this.http
      .post<ApiEnvelope<Attendance>>(`${this.base}/clock-out`, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  bulkInput(input: BulkAttendanceInput) {
    return this.http
      .post<ApiEnvelope<Attendance>>(`${this.base}/bulk`, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  /** Daftar karyawan yang boleh diinput absensinya oleh aktor yang login (scoped sesuai peran/SPV Project di backend). */
  bulkTargets() {
    return this.http
      .get<ApiEnvelope<Employee[]>>(`${this.base}/bulk-targets`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
