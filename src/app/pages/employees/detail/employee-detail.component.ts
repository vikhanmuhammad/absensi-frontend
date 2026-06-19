import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { Attendance, Employee, LeaveRequest, StatusKehadiran, LeaveStatus, JenisCuti } from '../../../core/models/entities';

const STATUS_LABEL: Record<StatusKehadiran, string> = {
  TEPAT_WAKTU: 'Tepat Waktu',
  TERLAMBAT: 'Terlambat',
  ALFA: 'Alfa',
  PULANG_CEPAT: 'Pulang Cepat',
};
const STATUS_VARIANT: Record<StatusKehadiran, BadgeVariant> = {
  TEPAT_WAKTU: 'success',
  TERLAMBAT: 'warning',
  ALFA: 'danger',
  PULANG_CEPAT: 'info',
};
const LEAVE_STATUS_VARIANT: Record<LeaveStatus, BadgeVariant> = {
  MENUNGGU: 'warning',
  DISETUJUI: 'success',
  DITOLAK: 'danger',
};
const JENIS_LABEL: Record<JenisCuti, string> = {
  IZIN: 'Izin',
  CUTI_TAHUNAN: 'Cuti Tahunan',
  SAKIT: 'Sakit',
  MELAHIRKAN: 'Melahirkan',
};

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [DatePipe, DecimalPipe, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private attendanceService = inject(AttendanceService);
  private leaveRequestService = inject(LeaveRequestService);

  employee = signal<Employee | null>(null);
  attendances = signal<Attendance[]>([]);
  leaveRequests = signal<LeaveRequest[]>([]);
  loading = signal(true);
  saving = signal(false);
  message = signal('');

  initial = computed(() => (this.employee()?.namaLengkap.charAt(0) ?? '?').toUpperCase());

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.load(Number(id));
  }

  load(id: number) {
    this.loading.set(true);
    this.employeeService.getById(id).subscribe({
      next: (data) => {
        this.employee.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.attendanceService.history({ employeeId: id }).subscribe((data) => this.attendances.set(data.slice(0, 5)));
    this.leaveRequestService.listMine(id).subscribe((data) => this.leaveRequests.set(data.slice(0, 5)));
  }

  toggleActive() {
    const employee = this.employee();
    if (!employee) return;

    const nextStatus = !employee.statusAktif;
    if (!confirm(`${nextStatus ? 'Aktifkan' : 'Nonaktifkan'} karyawan ${employee.namaLengkap}?`)) return;

    this.saving.set(true);
    this.employeeService.update(employee.id, { statusAktif: nextStatus }).subscribe({
      next: (updated) => {
        this.employee.set(updated);
        this.saving.set(false);
        this.message.set(`Karyawan berhasil ${nextStatus ? 'diaktifkan' : 'dinonaktifkan'}.`);
      },
      error: () => this.saving.set(false),
    });
  }

  statusLabel(status: StatusKehadiran) {
    return STATUS_LABEL[status];
  }

  statusVariant(status: StatusKehadiran): BadgeVariant {
    return STATUS_VARIANT[status];
  }

  leaveVariant(status: LeaveStatus): BadgeVariant {
    return LEAVE_STATUS_VARIANT[status];
  }

  jenisLabel(jenis: JenisCuti) {
    return JENIS_LABEL[jenis];
  }
}
