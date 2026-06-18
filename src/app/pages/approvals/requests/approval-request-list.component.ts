import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveRequest, JenisCuti } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

const JENIS_LABEL: Record<JenisCuti, string> = {
  IZIN: 'Izin',
  CUTI_TAHUNAN: 'Cuti Tahunan',
  SAKIT: 'Sakit',
  MELAHIRKAN: 'Melahirkan',
};

@Component({
  selector: 'app-approval-request-list',
  standalone: true,
  imports: [DatePipe, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './approval-request-list.component.html',
  styleUrl: './approval-request-list.component.scss',
})
export class ApprovalRequestListComponent implements OnInit {
  private leaveRequestService = inject(LeaveRequestService);
  protected auth = inject(AuthService);

  pending = signal<LeaveRequest[]>([]);
  processedJustNow = signal<LeaveRequest[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  actingId = signal<string | null>(null);

  canApprove = computed(() => {
    const user = this.auth.currentUser();
    return !(user?.role === 'SUPER_ADMIN' && user.superAdminType === 'IT_MAINTENANCE');
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.leaveRequestService.listPending().subscribe({
      next: (data) => {
        this.pending.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  approve(item: LeaveRequest) {
    this.act(item, () => this.leaveRequestService.approve(item.id));
  }

  reject(item: LeaveRequest) {
    if (!confirm(`Tolak pengajuan ${this.jenisLabel(item.jenisCuti)} dari ${item.employee?.namaLengkap}?`)) return;
    this.act(item, () => this.leaveRequestService.reject(item.id));
  }

  private act(item: LeaveRequest, action: () => ReturnType<LeaveRequestService['approve']>) {
    this.actingId.set(item.id);
    this.errorMessage.set('');
    action().subscribe({
      next: (updated) => {
        this.pending.update((list) => list.filter((x) => x.id !== item.id));
        this.processedJustNow.update((list) => [updated, ...list].slice(0, 10));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal memproses pengajuan'));
        this.actingId.set(null);
      },
    });
  }

  jenisLabel(jenis: JenisCuti) {
    return JENIS_LABEL[jenis];
  }
}
