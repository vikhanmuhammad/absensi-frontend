import { Component } from '@angular/core';
import { PageStubComponent } from '../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Manajemen Akun" prompt="#10" design="docs/design/manajemen-akun.html"></app-page-stub>`,
})
export class AccountManagementComponent {}
