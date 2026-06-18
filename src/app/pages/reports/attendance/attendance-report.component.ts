import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ReportService } from '../../../core/services/report.service';
import { DivisionService } from '../../../core/services/division.service';
import { ProjectService } from '../../../core/services/project.service';
import { AttendanceReport, Division, Project } from '../../../core/models/entities';

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
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

  filterForm = this.fb.nonNullable.group({
    startDate: [toDateInputValue(new Date(new Date().setDate(1)))],
    endDate: [toDateInputValue(new Date())],
    divisiId: [''],
    projectId: [''],
  });

  totalHadir = computed(() => this.report()?.perDivisi.reduce((sum, d) => sum + d.hadir, 0) ?? 0);
  totalTerlambat = computed(() => this.report()?.perDivisi.reduce((sum, d) => sum + d.terlambat, 0) ?? 0);
  totalAlfa = computed(() => this.report()?.perDivisi.reduce((sum, d) => sum + d.alfa, 0) ?? 0);

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
        divisiId: value.divisiId || undefined,
        projectId: value.projectId || undefined,
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
}
