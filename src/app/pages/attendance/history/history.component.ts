import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { LeaveRequestService } from '../../../core/services/leave-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { Attendance, StatusKehadiran } from '../../../core/models/entities';

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

interface MonthOption {
  value: string;
  label: string;
  year: number;
  month: number;
}

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [DatePipe, FormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class AttendanceHistoryComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private leaveRequestService = inject(LeaveRequestService);
  protected auth = inject(AuthService);

  records = signal<Attendance[]>([]);
  loading = signal(true);
  statusFilter = signal<'ALL' | StatusKehadiran>('ALL');
  leaveCount = signal(0);
  monthOptions: MonthOption[] = [];
  selectedMonth = signal('');

  filteredRecords = computed(() => {
    const status = this.statusFilter();
    if (status === 'ALL') return this.records();
    return this.records().filter((r) => r.statusKehadiran === status);
  });

  selectedMonthLabel = computed(
    () => this.monthOptions.find((m) => m.value === this.selectedMonth())?.label ?? '',
  );

  totalHadir = computed(() => this.records().filter((r) => !!r.jamMasuk).length);
  totalTerlambat = computed(() => this.records().filter((r) => r.statusKehadiran === 'TERLAMBAT').length);
  totalAlfa = computed(() => this.records().filter((r) => r.statusKehadiran === 'ALFA').length);

  ngOnInit() {
    this.monthOptions = this.buildMonthOptions();
    this.selectedMonth.set(this.monthOptions[0].value);
    this.load();
  }

  private buildMonthOptions(): MonthOption[] {
    const options: MonthOption[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }
    return options;
  }

  onFilterChange() {
    this.load();
  }

  load() {
    const employeeId = this.auth.currentUser()?.employee?.id;
    if (!employeeId) {
      this.loading.set(false);
      return;
    }

    const opt = this.monthOptions.find((m) => m.value === this.selectedMonth()) ?? this.monthOptions[0];
    const monthStart = new Date(opt.year, opt.month, 1);
    const monthEnd = new Date(opt.year, opt.month + 1, 0);
    const startDate = monthStart.toISOString().slice(0, 10);
    const endDate = monthEnd.toISOString().slice(0, 10);

    this.loading.set(true);
    this.attendanceService.history({ employeeId, startDate, endDate }).subscribe({
      next: (data) => {
        this.records.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.leaveRequestService.listMine().subscribe((items) => {
      const count = items.filter((item) => {
        if (item.status !== 'DISETUJUI') return false;
        const start = new Date(item.tanggalMulai);
        const end = new Date(item.tanggalSelesai);
        return start <= monthEnd && end >= monthStart;
      }).length;
      this.leaveCount.set(count);
    });
  }

  print() {
    window.print();
  }

  statusLabel(status: StatusKehadiran) {
    return STATUS_LABEL[status];
  }

  statusVariant(status: StatusKehadiran): BadgeVariant {
    return STATUS_VARIANT[status];
  }
}
