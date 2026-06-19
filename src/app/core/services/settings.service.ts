import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope } from '../models/api-envelope';

export interface SystemSettings {
  id: number;
  jamMasukStandar: string;
  jamPulangStandar: string;
  batasTerlambat: string;
  batasAlfa: string;
  updatedAt: string;
}

export type UpdateSystemSettingsInput = Partial<
  Pick<SystemSettings, 'jamMasukStandar' | 'jamPulangStandar' | 'batasTerlambat' | 'batasAlfa'>
>;

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/settings`;

  get() {
    return this.http.get<ApiEnvelope<SystemSettings>>(this.base, { withCredentials: true }).pipe(map((res) => res.data));
  }

  update(data: UpdateSystemSettingsInput) {
    return this.http
      .patch<ApiEnvelope<SystemSettings>>(this.base, data, { withCredentials: true })
      .pipe(map((res) => res.data));
  }
}
