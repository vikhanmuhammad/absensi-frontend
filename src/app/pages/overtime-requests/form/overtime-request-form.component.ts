import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { OvertimeRequestService } from '../../../core/services/overtime-request.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { OvertimeRequest, OvertimeStatus, StatusKaryawan } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

const STATUS_LABEL: Record<OvertimeStatus, string> = {
  DIAJUKAN: 'Diajukan',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  DICATAT_OTOMATIS: 'Tercatat Otomatis',
};

const STATUS_VARIANT: Record<OvertimeStatus, BadgeVariant> = {
  DIAJUKAN: 'warning',
  DISETUJUI: 'success',
  DITOLAK: 'danger',
  DICATAT_OTOMATIS: 'info',
};

@Component({
  selector: 'app-overtime-request-form',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './overtime-request-form.component.html',
  styleUrl: './overtime-request-form.component.scss',
})
export class OvertimeRequestFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private overtimeRequestService = inject(OvertimeRequestService);
  private employeeService = inject(EmployeeService);
  protected auth = inject(AuthService);

  history = signal<OvertimeRequest[]>([]);
  statusKaryawan = signal<StatusKaryawan | null>(null);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  isHarian = computed(() => this.statusKaryawan() === 'HARIAN');

  form = this.fb.nonNullable.group({
    tanggal: ['', Validators.required],
    deskripsiAlasan: ['', Validators.required],
  });

  ngOnInit() {
    this.load();

    const employeeId = this.auth.currentUser()?.employee?.id;
    if (employeeId) {
      this.employeeService.getById(employeeId).subscribe((emp) => this.statusKaryawan.set(emp.statusKaryawan));
    }
  }

  load() {
    this.loading.set(true);
    this.overtimeRequestService.listMine().subscribe({
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

    this.submitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.overtimeRequestService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMessage.set('Pengajuan lembur berhasil dikirim, menunggu approval.');
        this.form.reset({ tanggal: '', deskripsiAlasan: '' });
        this.load();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Gagal mengirim pengajuan lembur'));
      },
    });
  }

  statusLabel(status: OvertimeStatus) {
    return STATUS_LABEL[status];
  }

  statusVariant(status: OvertimeStatus): BadgeVariant {
    return STATUS_VARIANT[status];
  }
}
