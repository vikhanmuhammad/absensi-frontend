import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Riwayat Absensi" prompt="#4" design="docs/design/riwayat-absensi.html"></app-page-stub>`,
})
export class AttendanceHistoryComponent {}
