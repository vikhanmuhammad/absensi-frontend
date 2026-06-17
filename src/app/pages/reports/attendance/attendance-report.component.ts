import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Laporan Absensi" prompt="#16" design="docs/design/laporan-absensi.html"></app-page-stub>`,
})
export class AttendanceReportComponent {}
