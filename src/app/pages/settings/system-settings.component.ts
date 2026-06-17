import { Component } from '@angular/core';
import { PageStubComponent } from '../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Pengaturan Sistem" prompt="#20" design="docs/design/pengaturan-sistem.html"></app-page-stub>`,
})
export class SystemSettingsComponent {}
