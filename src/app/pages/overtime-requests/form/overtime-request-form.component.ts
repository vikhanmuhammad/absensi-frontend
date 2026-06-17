import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-overtime-request-form',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Pengajuan Lembur" prompt="#6" design="docs/design/pengajuan-lembur.html"></app-page-stub>`,
})
export class OvertimeRequestFormComponent {}
