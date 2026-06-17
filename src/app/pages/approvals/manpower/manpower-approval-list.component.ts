import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-manpower-approval-list',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Approval Manpower" prompt="#14" design="docs/design/approval-manpower.html"></app-page-stub>`,
})
export class ManpowerApprovalListComponent {}
