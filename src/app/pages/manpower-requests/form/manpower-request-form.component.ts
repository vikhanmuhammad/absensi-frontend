import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-manpower-request-form',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Request Manpower" prompt="#13" design="docs/design/request-manpower.html"></app-page-stub>`,
})
export class ManpowerRequestFormComponent {}
