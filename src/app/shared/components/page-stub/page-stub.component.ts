import { Component, Input } from '@angular/core';

/**
 * Placeholder seragam untuk halaman yang belum dikonversi dari prototype HTML.
 * Hapus pemakaian ini saat halaman sudah diimplementasikan sesuai prompt terkait
 * di docs/copilot-guides/frontend-guide.md.
 */
@Component({
  selector: 'app-page-stub',
  standalone: true,
  templateUrl: './page-stub.component.html',
  styleUrl: './page-stub.component.scss',
})
export class PageStubComponent {
  @Input() title = '';
  @Input() prompt = '';
  @Input() design = '';
}
