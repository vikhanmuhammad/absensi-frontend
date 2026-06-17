import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-leave-request-form',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Pengajuan Cuti" prompt="#5" design="docs/design/pengajuan-cuti.html"></app-page-stub>`,
})
export class LeaveRequestFormComponent {}
