import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ProjectService } from '../../../core/services/project.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee, Project, ProjectStatus } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  AKTIF: 'Aktif',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};

const STATUS_VARIANT: Record<ProjectStatus, BadgeVariant> = {
  AKTIF: 'success',
  SELESAI: 'muted',
  DIBATALKAN: 'danger',
};

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private employeeService = inject(EmployeeService);
  protected auth = inject(AuthService);

  projects = signal<Project[]>([]);
  employees = signal<Employee[]>([]);
  loading = signal(true);
  showForm = signal(false);
  submitting = signal(false);
  errorMessage = signal('');

  canCreate = false;

  form = inject(FormBuilder).nonNullable.group({
    namaProjek: ['', Validators.required],
    tanggalMulai: ['', Validators.required],
    tanggalBerakhir: ['', Validators.required],
    deskripsi: [''],
    spvProjectEmployeeId: ['', Validators.required],
  });

  ngOnInit() {
    this.canCreate = ['SUPER_ADMIN', 'HRD'].includes(this.auth.currentUser()?.role ?? '');
    this.load();
    if (this.canCreate) {
      this.employeeService.list().subscribe((data) => this.employees.set(data));
    }
  }

  load() {
    this.loading.set(true);
    this.projectService.list().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleForm() {
    this.showForm.update((v) => !v);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    const value = this.form.getRawValue();

    this.projectService
      .create({ ...value, deskripsi: value.deskripsi || undefined, spvProjectEmployeeId: Number(value.spvProjectEmployeeId) })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.form.reset({ namaProjek: '', tanggalMulai: '', tanggalBerakhir: '', deskripsi: '', spvProjectEmployeeId: '' });
          this.load();
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(extractErrorMessage(err, 'Gagal membuat projek'));
        },
      });
  }

  statusLabel(status: ProjectStatus) {
    return STATUS_LABEL[status];
  }

  statusVariant(status: ProjectStatus): BadgeVariant {
    return STATUS_VARIANT[status];
  }
}
