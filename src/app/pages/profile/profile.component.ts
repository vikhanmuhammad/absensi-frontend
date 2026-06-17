import { Component } from '@angular/core';
import { PageStubComponent } from '../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Profil Saya" prompt="#18" design="docs/design/profil-saya.html"></app-page-stub>`,
})
export class ProfileComponent {}
