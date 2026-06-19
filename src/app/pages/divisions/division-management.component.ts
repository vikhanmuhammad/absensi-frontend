import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { DivisionService } from '../../core/services/division.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Division, Employee } from '../../core/models/entities';
import { extractErrorMessage } from '../../core/models/api-envelope';

@Component({
  selector: 'app-division-management',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './division-management.component.html',
  styleUrl: './division-management.component.scss',
})
export class DivisionManagementComponent implements OnInit {
  private divisionService = inject(DivisionService);
  private employeeService = inject(EmployeeService);

  divisions = signal<Division[]>([]);
  employees = signal<Employee[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<number | null>(null);
  submitting = signal(false);
  errorMessage = signal('');

  form = inject(FormBuilder).nonNullable.group({
    namaDivisi: ['', Validators.required],
    supervisorEmployeeId: [''],
  });

  ngOnInit() {
    this.load();
    this.employeeService.list().subscribe((data) => this.employees.set(data));
  }

  load() {
    this.loading.set(true);
    this.divisionService.list().subscribe({
      next: (data) => {
        this.divisions.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ namaDivisi: '', supervisorEmployeeId: '' });
    this.showForm.set(true);
  }

  openEdit(item: Division) {
    this.editingId.set(item.id);
    this.form.reset({ namaDivisi: item.namaDivisi, supervisorEmployeeId: item.supervisorEmployeeId ? String(item.supervisorEmployeeId) : '' });
    this.showForm.set(true);
  }

  cancel() {
    this.showForm.set(false);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    const value = this.form.getRawValue();
    const payload = {
      namaDivisi: value.namaDivisi,
      supervisorEmployeeId: value.supervisorEmployeeId ? Number(value.supervisorEmployeeId) : undefined,
    };

    const editingId = this.editingId();
    const request = editingId ? this.divisionService.update(editingId, payload) : this.divisionService.create(payload);

    request.subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.load();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(extractErrorMessage(err, 'Gagal menyimpan divisi'));
      },
    });
  }
}
