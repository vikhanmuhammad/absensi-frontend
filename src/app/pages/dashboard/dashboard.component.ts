import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ReportService } from '../../core/services/report.service';
import { LeaveRequestService } from '../../core/services/leave-request.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary, AttendanceReport, LeaveRequest, Attendance } from '../../core/models/entities';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private reportService = inject(ReportService);
  private leaveRequestService = inject(LeaveRequestService);
  private attendanceService = inject(AttendanceService);
  protected auth = inject(AuthService);

  summary = signal<DashboardSummary | null>(null);
  attendanceReport = signal<AttendanceReport | null>(null);
  pendingLeaveRequests = signal<LeaveRequest[]>([]);
  lateToday = signal<Attendance[]>([]);
  loading = signal(true);

  today = new Date();

  greeting = computed(() => {
    const hour = this.today.getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  });

  displayName = computed(
    () => this.auth.currentUser()?.employee?.namaLengkap || this.auth.currentUser()?.username || '',
  );

  ngOnInit() {
    const todayStr = toDateInputValue(this.today);
    const weekAgo = new Date(this.today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = toDateInputValue(weekAgo);

    this.reportService.dashboardSummary().subscribe({ next: (data) => this.summary.set(data) });

    this.reportService
      .attendanceReport({ startDate: weekAgoStr, endDate: todayStr })
      .subscribe({ next: (data) => this.attendanceReport.set(data) });

    this.leaveRequestService.listPending().subscribe({ next: (data) => this.pendingLeaveRequests.set(data.slice(0, 5)) });

    this.attendanceService.history({ startDate: todayStr, endDate: todayStr }).subscribe({
      next: (data) => {
        this.lateToday.set(data.filter((a) => a.statusKehadiran === 'TERLAMBAT'));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  jenisCutiLabel(jenis: LeaveRequest['jenisCuti']) {
    const map: Record<LeaveRequest['jenisCuti'], string> = {
      IZIN: 'Izin',
      CUTI_TAHUNAN: 'Cuti Tahunan',
      SAKIT: 'Sakit',
      MELAHIRKAN: 'Melahirkan',
    };
    return map[jenis];
  }

  divisiPercentage(hadir: number, terlambat: number, alfa: number) {
    const total = hadir + terlambat + alfa;
    return total === 0 ? 0 : Math.round((hadir / total) * 100);
  }
}
