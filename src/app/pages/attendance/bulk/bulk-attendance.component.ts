import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee } from '../../../core/models/entities';

@Component({
  selector: 'app-bulk-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './bulk-attendance.component.html',
  styleUrl: './bulk-attendance.component.scss',
})
export class BulkAttendanceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private attendanceService = inject(AttendanceService);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);

  employees = signal<Employee[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      tanggal: ['', Validators.required],
      jamMasuk: ['', Validators.required],
      jamKeluar: [''],
      deskripsiInputMassal: ['', Validators.required],
    });

    this.loadEmployees();
  }

  private loadEmployees(): void {
    const user = this.authService.currentUser();
    const filter: { divisiId?: number } = {};

    // Supervisor hanya lihat karyawan divisi sendiri
    if (user?.role === 'SUPERVISOR' && user.employee?.divisiId) {
      filter.divisiId = user.employee.divisiId;
    }

    this.employeeService.list(filter).subscribe({
      next: (data) => this.employees.set(data.filter((e) => e.statusAktif)),
    });
  }

  toggleSelect(id: number): void {
    const s = new Set(this.selectedIds());
    if (s.has(id)) s.delete(id);
    else s.add(id);
    this.selectedIds.set(s);
  }

  toggleAll(): void {
    const all = this.employees();
    if (this.selectedIds().size === all.length) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(all.map((e) => e.id)));
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  get allSelected(): boolean {
    return this.employees().length > 0 && this.selectedIds().size === this.employees().length;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.selectedIds().size === 0) {
      this.error.set('Pilih minimal 1 karyawan');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const { tanggal, jamMasuk, jamKeluar, deskripsiInputMassal } = this.form.value;
    const jamMasukStr = `${tanggal}T${jamMasuk}:00`;
    const jamKeluarStr = jamKeluar ? `${tanggal}T${jamKeluar}:00` : undefined;

    const requests = Array.from(this.selectedIds()).map((employeeId) =>
      this.attendanceService.bulkInput({
        employeeId,
        tanggal,
        jamMasuk: jamMasukStr,
        jamKeluar: jamKeluarStr,
        deskripsiInputMassal,
      }),
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(`Berhasil mencatat absensi untuk ${requests.length} karyawan`);
        this.selectedIds.set(new Set());
        this.form.reset();
      },
      error: (err) => {
        this.error.set(err?.error?.error?.message || 'Gagal menyimpan absensi massal');
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/absensi']);
  }
}
