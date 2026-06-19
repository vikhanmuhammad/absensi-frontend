import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { OvertimeRequest } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

@Component({
  selector: 'app-overtime-approval-list',
  standalone: true,
  imports: [DatePipe, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './overtime-approval-list.component.html',
  styleUrl: './overtime-approval-list.component.scss',
})
export class OvertimeApprovalListComponent implements OnInit {
  private overtimeRequestService = inject(OvertimeRequestService);
  protected auth = inject(AuthService);

  pending = signal<OvertimeRequest[]>([]);
  processedJustNow = signal<OvertimeRequest[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  actingId = signal<number | null>(null);

  canApprove = computed(() => {
    const user = this.auth.currentUser();
    return !(user?.role === 'SUPER_ADMIN' && user.superAdminType === 'IT_MAINTENANCE');
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.overtimeRequestService.listPending().subscribe({
      next: (data) => {
        this.pending.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  approve(item: OvertimeRequest) {
    this.act(item, () => this.overtimeRequestService.approve(item.id));
  }

  reject(item: OvertimeRequest) {
    if (!confirm(`Tolak pengajuan lembur dari ${item.employee?.namaLengkap}?`)) return;
    this.act(item, () => this.overtimeRequestService.reject(item.id));
  }

  private act(item: OvertimeRequest, action: () => ReturnType<OvertimeRequestService['approve']>) {
    this.actingId.set(item.id);
    this.errorMessage.set('');
    action().subscribe({
      next: (updated) => {
        this.pending.update((list) => list.filter((x) => x.id !== item.id));
        this.processedJustNow.update((list) => [updated, ...list].slice(0, 10));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal memproses pengajuan lembur'));
        this.actingId.set(null);
      },
    });
  }
}
