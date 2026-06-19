import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { LeaveRequest, JenisCuti, OvertimeRequest } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

const JENIS_LABEL: Record<JenisCuti, string> = {
  IZIN: 'Izin',
  CUTI_TAHUNAN: 'Cuti Tahunan',
  SAKIT: 'Sakit',
  MELAHIRKAN: 'Melahirkan',
};

/** Wrapper untuk unified display di satu tabel */
export interface PendingItem {
  id: number;
  tipe: 'LEAVE' | 'OVERTIME';
  nama: string;
  divisi: string;
  jenis: string;
  tanggal: string;
  alasan: string;
  _leave?: LeaveRequest;
  _overtime?: OvertimeRequest;
}

/** Wrapper untuk item yang sudah diproses */
export interface ProcessedItem {
  id: number;
  tipe: 'LEAVE' | 'OVERTIME';
  jenis: string;
  tanggal: string;
  status: string;
}

@Component({
  selector: 'app-approval-request-list',
  standalone: true,
  imports: [DatePipe, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './approval-request-list.component.html',
  styleUrl: './approval-request-list.component.scss',
})
export class ApprovalRequestListComponent implements OnInit {
  private leaveRequestService = inject(LeaveRequestService);
  private overtimeRequestService = inject(OvertimeRequestService);
  protected auth = inject(AuthService);

  pendingLeaves = signal<LeaveRequest[]>([]);
  pendingOvertime = signal<OvertimeRequest[]>([]);
  processedJustNow = signal<ProcessedItem[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  actingId = signal<string | null>(null); // "L-123" or "O-456"

  private fmtDate(d: string | Date | undefined | null): string {
    if (!d) return '-';
    const dt = typeof d === 'string' ? new Date(d) : d;
    return isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  pending = computed<PendingItem[]>(() => {
    const leaves: PendingItem[] = this.pendingLeaves().map((lr) => ({
      id: lr.id,
      tipe: 'LEAVE' as const,
      nama: lr.employee?.namaLengkap ?? '-',
      divisi: lr.employee?.divisi?.namaDivisi ?? '-',
      jenis: JENIS_LABEL[lr.jenisCuti],
      tanggal: `${this.fmtDate(lr.tanggalMulai)} – ${this.fmtDate(lr.tanggalSelesai)}`,
      alasan: lr.alasan,
      _leave: lr,
    }));
    const overtime: PendingItem[] = this.pendingOvertime().map((ot) => ({
      id: ot.id,
      tipe: 'OVERTIME' as const,
      nama: ot.employee?.namaLengkap ?? '-',
      divisi: ot.employee?.divisi?.namaDivisi ?? '-',
      jenis: 'Lembur Individual',
      tanggal: this.fmtDate(ot.tanggal),
      alasan: ot.deskripsiAlasan,
      _overtime: ot,
    }));
    return [...leaves, ...overtime];
  });

  canApprove = computed(() => {
    const user = this.auth.currentUser();
    return !(user?.role === 'SUPER_ADMIN' && user.superAdminType === 'IT_MAINTENANCE');
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    let done = 0;
    const check = () => { done++; if (done === 2) this.loading.set(false); };

    this.leaveRequestService.listPending().subscribe({
      next: (data) => { this.pendingLeaves.set(data); check(); },
      error: () => check(),
    });
    this.overtimeRequestService.listPending().subscribe({
      next: (data) => { this.pendingOvertime.set(data); check(); },
      error: () => check(),
    });
  }

  actKey(tipe: string, id: number) {
    return `${tipe === 'LEAVE' ? 'L' : 'O'}-${id}`;
  }

  approve(item: PendingItem) {
    if (item.tipe === 'LEAVE') {
      this.approveLeave(item);
    } else {
      this.approveOvertime(item);
    }
  }

  reject(item: PendingItem) {
    const label = item.tipe === 'LEAVE' ? `${item.jenis} dari ${item.nama}` : `lembur dari ${item.nama}`;
    if (!confirm(`Tolak pengajuan ${label}?`)) return;
    if (item.tipe === 'LEAVE') {
      this.rejectLeave(item);
    } else {
      this.rejectOvertime(item);
    }
  }

  private approveLeave(item: PendingItem) {
    const lr = item._leave!;
    this.actingId.set(this.actKey('LEAVE', lr.id));
    this.errorMessage.set('');
    this.leaveRequestService.approve(lr.id).subscribe({
      next: (updated) => {
        this.pendingLeaves.update((list) => list.filter((x) => x.id !== lr.id));
        this.processedJustNow.update((list) => [
          { id: updated.id, tipe: 'LEAVE' as const, jenis: JENIS_LABEL[lr.jenisCuti], tanggal: `${this.fmtDate(lr.tanggalMulai)} \u2013 ${this.fmtDate(lr.tanggalSelesai)}`, status: updated.status },
          ...list,
        ].slice(0, 15));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal memproses pengajuan'));
        this.actingId.set(null);
      },
    });
  }

  private rejectLeave(item: PendingItem) {
    const lr = item._leave!;
    this.actingId.set(this.actKey('LEAVE', lr.id));
    this.errorMessage.set('');
    this.leaveRequestService.reject(lr.id).subscribe({
      next: (updated) => {
        this.pendingLeaves.update((list) => list.filter((x) => x.id !== lr.id));
        this.processedJustNow.update((list) => [
          { id: updated.id, tipe: 'LEAVE' as const, jenis: JENIS_LABEL[lr.jenisCuti], tanggal: `${this.fmtDate(lr.tanggalMulai)} \u2013 ${this.fmtDate(lr.tanggalSelesai)}`, status: updated.status },
          ...list,
        ].slice(0, 15));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal memproses pengajuan'));
        this.actingId.set(null);
      },
    });
  }

  private approveOvertime(item: PendingItem) {
    const ot = item._overtime!;
    this.actingId.set(this.actKey('OVERTIME', ot.id));
    this.errorMessage.set('');
    this.overtimeRequestService.approve(ot.id).subscribe({
      next: (updated) => {
        this.pendingOvertime.update((list) => list.filter((x) => x.id !== ot.id));
        this.processedJustNow.update((list) => [
          { id: updated.id, tipe: 'OVERTIME' as const, jenis: 'Lembur Individual', tanggal: this.fmtDate(ot.tanggal), status: updated.status },
          ...list,
        ].slice(0, 15));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal memproses pengajuan'));
        this.actingId.set(null);
      },
    });
  }

  private rejectOvertime(item: PendingItem) {
    const ot = item._overtime!;
    this.actingId.set(this.actKey('OVERTIME', ot.id));
    this.errorMessage.set('');
    this.overtimeRequestService.reject(ot.id).subscribe({
      next: (updated) => {
        this.pendingOvertime.update((list) => list.filter((x) => x.id !== ot.id));
        this.processedJustNow.update((list) => [
          { id: updated.id, tipe: 'OVERTIME' as const, jenis: 'Lembur Individual', tanggal: this.fmtDate(ot.tanggal), status: updated.status },
          ...list,
        ].slice(0, 15));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal memproses pengajuan'));
        this.actingId.set(null);
      },
    });
  }
}
