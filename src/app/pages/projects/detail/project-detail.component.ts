import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Detail Projek" prompt="#12" design="docs/design/detail-projek.html"></app-page-stub>`,
})
export class ProjectDetailComponent {}
