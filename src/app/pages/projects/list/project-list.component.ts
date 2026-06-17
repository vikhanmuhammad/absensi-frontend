import { Component } from '@angular/core';
import { PageStubComponent } from '../../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Daftar Projek" prompt="#11" design="docs/design/daftar-projek.html"></app-page-stub>`,
})
export class ProjectListComponent {}
