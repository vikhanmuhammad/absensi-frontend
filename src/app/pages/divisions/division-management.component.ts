import { Component } from '@angular/core';
import { PageStubComponent } from '../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-division-management',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Manajemen Divisi" prompt="#19" design="docs/design/manajemen-divisi.html"></app-page-stub>`,
})
export class DivisionManagementComponent {}
