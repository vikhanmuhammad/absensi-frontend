import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { Project } from '../models/entities';

export interface CreateProjectInput {
  namaProjek: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  deskripsi?: string;
  spvProjectEmployeeId: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/projects`;

  list() {
    return this.http.get<ApiEnvelope<Project[]>>(this.base, { withCredentials: true }).pipe(map((res) => res.data));
  }

  getById(id: string) {
    return this.http
      .get<ApiEnvelope<Project>>(`${this.base}/${id}`, { withCredentials: true })
      .pipe(map((res) => res.data));
  }

  create(input: CreateProjectInput) {
    return this.http
      .post<ApiEnvelope<Project>>(this.base, input, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
