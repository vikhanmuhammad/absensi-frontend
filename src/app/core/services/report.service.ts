import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { AttendanceReport, DashboardSummary } from '../models/entities';

export interface AttendanceReportFilter {
  startDate?: string;
  endDate?: string;
  divisiId?: number;
  projectId?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reports`;

  dashboardSummary() {
    return this.http
      .get<ApiEnvelope<DashboardSummary>>(`${this.base}/dashboard-summary`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  attendanceReport(filter: AttendanceReportFilter = {}) {
    const params: Record<string, string | number> = {};
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;
    if (filter.divisiId) params['divisiId'] = filter.divisiId;
    if (filter.projectId) params['projectId'] = filter.projectId;

    return this.http
      .get<ApiEnvelope<AttendanceReport>>(`${this.base}/attendance`, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }

  downloadPdf(filter: AttendanceReportFilter = {}) {
    const params = new URLSearchParams();
    if (filter.startDate) params.set('startDate', filter.startDate);
    if (filter.endDate) params.set('endDate', filter.endDate);
    if (filter.divisiId) params.set('divisiId', String(filter.divisiId));
    if (filter.projectId) params.set('projectId', String(filter.projectId));

    const url = `${this.base}/attendance/export-pdf?${params.toString()}`;
    this.http
      .get(url, { withCredentials: true, responseType: 'blob' })
      .subscribe((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'laporan-absensi.pdf';
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }

  downloadExcel(filter: AttendanceReportFilter = {}) {
    const params = new URLSearchParams();
    if (filter.startDate) params.set('startDate', filter.startDate);
    if (filter.endDate) params.set('endDate', filter.endDate);
    if (filter.divisiId) params.set('divisiId', String(filter.divisiId));
    if (filter.projectId) params.set('projectId', String(filter.projectId));

    const url = `${this.base}/attendance/export-excel?${params.toString()}`;
    this.http
      .get(url, { withCredentials: true, responseType: 'blob' })
      .subscribe((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'laporan-absensi.xlsx';
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }
}
