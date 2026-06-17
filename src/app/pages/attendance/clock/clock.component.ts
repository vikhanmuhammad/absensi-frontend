import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-attendance-clock',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Absensi Harian" prompt="#3" design="docs/design/absensi-harian.html"></app-page-stub>`,
})
export class AttendanceClockComponent {}
