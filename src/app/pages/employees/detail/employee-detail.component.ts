import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Detail Karyawan" prompt="#9" design="docs/design/detail-karyawan.html"></app-page-stub>`,
})
export class EmployeeDetailComponent {}
