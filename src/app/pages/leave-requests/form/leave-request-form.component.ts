import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { JenisCuti, LeaveRequest, LeaveStatus } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

const ANNUAL_QUOTA = 12; // TODO: pindahkan ke perhitungan backend yang sesungguhnya (FR-REQ-06)

const JENIS_LABEL: Record<JenisCuti, string> = {
  IZIN: 'Izin',
  CUTI_TAHUNAN: 'Cuti Tahunan',
  SAKIT: 'Sakit',
  MELAHIRKAN: 'Melahirkan',
};

const STATUS_LABEL: Record<LeaveStatus, string> = {
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
};

const STATUS_VARIANT: Record<LeaveStatus, BadgeVariant> = {
  MENUNGGU: 'warning',
  DISETUJUI: 'success',
  DITOLAK: 'danger',
};

@Component({
  selector: 'app-leave-request-form',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './leave-request-form.component.html',
  styleUrl: './leave-request-form.component.scss',
})
export class LeaveRequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private leaveRequestService = inject(LeaveRequestService);

  history = signal<LeaveRequest[]>([]);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  dateWarning = signal('');

  minDate = (() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  })();

  form = this.fb.nonNullable.group({
    jenisCuti: ['CUTI_TAHUNAN' as JenisCuti, Validators.required],
    tanggalMulai: ['', Validators.required],
    tanggalSelesai: ['', Validators.required],
    alasan: ['', Validators.required],
  });

  needsDocument = computed(() => ['SAKIT', 'MELAHIRKAN'].includes(this.form.controls.jenisCuti.value));

  usedDays = computed(() => {
    const year = new Date().getFullYear();
    return this.history()
      .filter((item) => item.jenisCuti === 'CUTI_TAHUNAN' && item.status === 'DISETUJUI')
      .filter((item) => new Date(item.tanggalMulai).getFullYear() === year)
      .reduce((total, item) => {
        const days =
          (new Date(item.tanggalSelesai).getTime() - new Date(item.tanggalMulai).getTime()) / 86400000 + 1;
        return total + Math.max(1, Math.round(days));
      }, 0);
  });

  remainingDays = computed(() => Math.max(0, ANNUAL_QUOTA - this.usedDays()));

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.leaveRequestService.listMine().subscribe({
      next: (data) => {
        this.history.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Validasi: tidak boleh backdate & tidak boleh weekend
    const { tanggalMulai, tanggalSelesai } = this.form.getRawValue();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (new Date(tanggalMulai) < today) {
      this.dateWarning.set('Tanggal mulai tidak boleh di masa lalu.');
      return;
    }
    if (new Date(tanggalSelesai) < new Date(tanggalMulai)) {
      this.dateWarning.set('Tanggal selesai harus sama atau setelah tanggal mulai.');
      return;
    }

    // Cek apakah ada hari Sabtu/Minggu dalam rentang
    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) {
        this.dateWarning.set('Pengajuan cuti/izin tidak dapat mencakup hari Sabtu atau Minggu.');
        return;
      }
    }

    this.dateWarning.set('');
    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.leaveRequestService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Pengajuan cuti berhasil dikirim, menunggu approval.');
        this.form.reset({ jenisCuti: 'CUTI_TAHUNAN', tanggalMulai: '', tanggalSelesai: '', alasan: '' });
        this.load();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Gagal mengirim pengajuan cuti'));
      },
    });
  }

  jenisLabel(jenis: JenisCuti) {
    return JENIS_LABEL[jenis];
  }

  statusLabel(status: LeaveStatus) {
    return STATUS_LABEL[status];
  }

  statusVariant(status: LeaveStatus): BadgeVariant {
    return STATUS_VARIANT[status];
  }
}
