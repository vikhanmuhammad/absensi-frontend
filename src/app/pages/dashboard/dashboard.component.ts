import { Component } from '@angular/core';
import { PageStubComponent } from '../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub
    title="Dashboard"
    prompt="#2"
    design="docs/design/dashboard.html"
  ></app-page-stub>`,
})
export class DashboardComponent {}
