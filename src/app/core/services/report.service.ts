import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { AttendanceReport, DashboardSummary } from '../models/entities';

export interface AttendanceReportFilter {
  startDate?: string;
  endDate?: string;
  divisiId?: string;
  projectId?: string;
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
    const params: Record<string, string> = {};
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;
    if (filter.divisiId) params['divisiId'] = filter.divisiId;
    if (filter.projectId) params['projectId'] = filter.projectId;

    return this.http
      .get<ApiEnvelope<AttendanceReport>>(`${this.base}/attendance`, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
