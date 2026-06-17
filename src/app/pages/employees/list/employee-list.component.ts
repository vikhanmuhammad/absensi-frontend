import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Data Karyawan" prompt="#8" design="docs/design/data-karyawan.html"></app-page-stub>`,
})
export class EmployeeListComponent {}
