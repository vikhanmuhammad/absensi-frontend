import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ProjectService } from '../../../core/services/project.service';
import { DivisionService } from '../../../core/services/division.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ManpowerRequestService } from '../../../core/services/manpower-request.service';
import { AuthService } from '../../../core/services/auth.service';
import { Division, Employee, ManpowerMode, ManpowerStatus, Project } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

const STATUS_VARIANT: Record<ManpowerStatus, BadgeVariant> = {
  MENUNGGU: 'warning',
  DISETUJUI: 'success',
  DITOLAK: 'danger',
};

@Component({
  selector: 'app-manpower-request-form',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './manpower-request-form.component.html',
  styleUrl: './manpower-request-form.component.scss',
})
export class ManpowerRequestFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  private divisionService = inject(DivisionService);
  private employeeService = inject(EmployeeService);
  private manpowerRequestService = inject(ManpowerRequestService);
  protected auth = inject(AuthService);

  projectId = '';
  project = signal<Project | null>(null);
  divisions = signal<Division[]>([]);
  candidateEmployees = signal<Employee[]>([]);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  isSpvOfThisProject = computed(() => {
    const employeeId = this.auth.currentUser()?.employee?.id;
    return !!employeeId && employeeId === this.project()?.spvProjectEmployeeId;
  });

  form = inject(FormBuilder).nonNullable.group({
    divisiAsalId: ['', Validators.required],
    mode: ['SPESIFIK' as ManpowerMode, Validators.required],
    employeeId: [''],
    jumlahDiminta: [1],
    kriteria: [''],
    tanggalMulaiPenugasan: ['', Validators.required],
    tanggalAkhirPenugasan: ['', Validators.required],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.projectId = id;

    this.divisionService.list().subscribe((data) => this.divisions.set(data));

    this.projectService.getById(id).subscribe({
      next: (data) => {
        this.project.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.form.controls.divisiAsalId.valueChanges.subscribe((divisiId) => {
      this.candidateEmployees.set([]);
      this.form.controls.employeeId.setValue('');
      if (divisiId) {
        this.employeeService.list({ divisiId }).subscribe((data) => this.candidateEmployees.set(data));
      }
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
    const value = this.form.getRawValue();

    this.manpowerRequestService
      .create({
        projectId: this.projectId,
        divisiAsalId: value.divisiAsalId,
        mode: value.mode,
        employeeId: value.mode === 'SPESIFIK' ? value.employeeId : undefined,
        jumlahDiminta: value.mode === 'HEADCOUNT' ? value.jumlahDiminta : undefined,
        kriteria: value.mode === 'HEADCOUNT' ? value.kriteria : undefined,
        tanggalMulaiPenugasan: value.tanggalMulaiPenugasan,
        tanggalAkhirPenugasan: value.tanggalAkhirPenugasan,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.successMessage.set('Request manpower berhasil diajukan.');
          this.projectService.getById(this.projectId).subscribe((data) => this.project.set(data));
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(extractErrorMessage(err, 'Gagal mengajukan request manpower'));
        },
      });
  }

  statusVariant(status: ManpowerStatus): BadgeVariant {
    return STATUS_VARIANT[status];
  }
}
