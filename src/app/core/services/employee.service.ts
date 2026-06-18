import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { Employee, StatusKaryawan } from '../models/entities';

export interface EmployeeFilter {
  search?: string;
  divisiId?: string;
  statusKaryawan?: StatusKaryawan;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/employees`;

  list(filter: EmployeeFilter = {}) {
    const params: Record<string, string> = {};
    if (filter.search) params['search'] = filter.search;
    if (filter.divisiId) params['divisiId'] = filter.divisiId;
    if (filter.statusKaryawan) params['statusKaryawan'] = filter.statusKaryawan;

    return this.http
      .get<ApiEnvelope<Employee[]>>(this.base, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }

  getById(id: string) {
    return this.http
      .get<ApiEnvelope<Employee>>(`${this.base}/${id}`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  create(data: Record<string, unknown>) {
    return this.http
      .post<ApiEnvelope<Employee>>(this.base, data, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  update(id: string, data: Partial<Employee>) {
    return this.http
      .patch<ApiEnvelope<Employee>>(`${this.base}/${id}`, data, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
