import { Component } from '@angular/core';
import { PageStubComponent } from '../../shared/components/page-stub/page-stub.component';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [PageStubComponent],
  template: `<app-page-stub title="Notifikasi" prompt="#17" design="docs/design/notifikasi.html"></app-page-stub>`,
})
export class NotificationListComponent {}
