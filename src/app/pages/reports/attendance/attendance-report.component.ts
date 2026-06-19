import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ReportService } from '../../../core/services/report.service';
import { DivisionService } from '../../../core/services/division.service';
import { ProjectService } from '../../../core/services/project.service';
import { AttendanceReport, Division, Project } from '../../../core/models/entities';
import { IconComponent } from '../../../shared/components/icon/icon.component';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent, IconComponent],
  templateUrl: './attendance-report.component.html',
  styleUrl: './attendance-report.component.scss',
})
export class AttendanceReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private divisionService = inject(DivisionService);
  private projectService = inject(ProjectService);
  private fb = inject(FormBuilder);

  report = signal<AttendanceReport | null>(null);
  divisions = signal<Division[]>([]);
  projects = signal<Project[]>([]);
  loading = signal(true);
  expandedDivisi = signal<number | null>(null);

  toggleDivisi(divisiId: number) {
    this.expandedDivisi.set(this.expandedDivisi() === divisiId ? null : divisiId);
  }

  employeesOf(divisiId: number) {
    return this.report()?.perEmployee.filter((e) => e.divisiId === divisiId) ?? [];
  }

  filterForm = this.fb.nonNullable.group({
    startDate: [toDateInputValue(new Date(new Date().setDate(1)))],
    endDate: [toDateInputValue(new Date())],
    divisiId: [''],
    projectId: [''],
  });

  totalHadir = computed(() => this.report()?.summary.totalHadir ?? 0);
  totalTerlambat = computed(() => this.report()?.summary.totalTerlambat ?? 0);
  totalAlfa = computed(() => this.report()?.summary.totalAlfa ?? 0);
  totalLembur = computed(() => this.report()?.summary.totalLembur ?? 0);
  totalSalary = computed(() => this.report()?.summary.totalEstimatedSalary ?? 0);

  ngOnInit() {
    this.divisionService.list().subscribe((data) => this.divisions.set(data));
    this.projectService.list().subscribe((data) => this.projects.set(data));
    this.load();
  }

  load() {
    this.loading.set(true);
    const value = this.filterForm.getRawValue();
    this.reportService
      .attendanceReport({
        startDate: value.startDate || undefined,
        endDate: value.endDate || undefined,
        divisiId: value.divisiId ? Number(value.divisiId) : undefined,
        projectId: value.projectId ? Number(value.projectId) : undefined,
      })
      .subscribe({
        next: (data) => {
          this.report.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  print() {
    window.print();
  }

  exportPdf() {
    const value = this.filterForm.getRawValue();
    this.reportService.downloadPdf({
      startDate: value.startDate || undefined,
      endDate: value.endDate || undefined,
      divisiId: value.divisiId ? Number(value.divisiId) : undefined,
      projectId: value.projectId ? Number(value.projectId) : undefined,
    });
  }

  exportExcel() {
    const value = this.filterForm.getRawValue();
    this.reportService.downloadExcel({
      startDate: value.startDate || undefined,
      endDate: value.endDate || undefined,
      divisiId: value.divisiId ? Number(value.divisiId) : undefined,
      projectId: value.projectId ? Number(value.projectId) : undefined,
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  }
}
