import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-project-assignment-history',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Riwayat Penugasan" prompt="#15" design="docs/design/riwayat-penugasan.html"></app-page-stub>`,
})
export class ProjectAssignmentHistoryComponent {}
