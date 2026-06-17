import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-approval-request-list',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Approval Pengajuan" prompt="#7" design="docs/design/approval-pengajuan.html"></app-page-stub>`,
})
export class ApprovalRequestListComponent {}
