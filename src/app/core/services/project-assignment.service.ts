import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';
import { ProjectAssignment } from '../models/entities';

export interface ProjectAssignmentFilter {
  search?: string;
  projectId?: number;
  divisiId?: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectAssignmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/project-assignments`;

  history(filter: ProjectAssignmentFilter = {}) {
    const params: Record<string, string | number> = {};
    if (filter.search) params['search'] = filter.search;
    if (filter.projectId) params['projectId'] = filter.projectId;
    if (filter.divisiId) params['divisiId'] = filter.divisiId;

    return this.http
      .get<ApiEnvelope<ProjectAssignment[]>>(this.base, { params, withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
