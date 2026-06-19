import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { DivisionService } from '../../../core/services/division.service';
import { Division } from '../../../core/models/entities';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private employeeService = inject(EmployeeService);
  private divisionService = inject(DivisionService);

  divisions = signal<Division[]>([]);
  isEditMode = false;
  employeeId: string | null = null;
  loading = signal(false);
  error = signal<string | null>(null);

  form!: FormGroup;

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.employeeId;

    this.initForm();
    this.loadDivisions();

    if (this.isEditMode && this.employeeId) {
      this.loadEmployee(Number(this.employeeId));
    }
  }

  private initForm(): void {
    if (this.isEditMode) {
      this.form = this.fb.group({
        namaLengkap: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        noHp: ['', Validators.required],
        alamat: ['', Validators.required],
        jabatan: ['', Validators.required],
        statusAktif: [true],
      });
    } else {
      this.form = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        nik: ['', Validators.required],
        namaLengkap: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        noHp: ['', Validators.required],
        alamat: ['', Validators.required],
        tanggalLahir: ['', Validators.required],
        jenisKelamin: ['L', Validators.required],
        statusPernikahan: ['BELUM MENIKAH', Validators.required],
        jabatan: ['', Validators.required],
        divisiId: ['', Validators.required],
        statusKaryawan: ['TETAP', Validators.required],
        tanggalMulaiKerja: ['', Validators.required],
        tanggalAkhirKontrak: [''],
        nominalUpah: ['', [Validators.required, Validators.min(0)]],
        satuanUpah: ['PER_BULAN', Validators.required],
        nominalUpahLembur: ['', [Validators.required, Validators.min(0)]],
        pengaliLembur: [''],
      });
    }
  }

  private loadDivisions(): void {
    this.divisionService.list().subscribe({
      next: (data) => this.divisions.set(data),
    });
  }

  private loadEmployee(id: number): void {
    this.loading.set(true);
    this.employeeService.getById(id).subscribe({
      next: (emp) => {
        this.form.patchValue({
          namaLengkap: emp.namaLengkap,
          email: emp.email,
          noHp: emp.noHp,
          alamat: emp.alamat,
          jabatan: emp.jabatan,
          statusAktif: emp.statusAktif,
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Gagal memuat data karyawan');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    if (this.isEditMode && this.employeeId) {
      this.employeeService.update(Number(this.employeeId), this.form.value).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/karyawan', this.employeeId]);
        },
        error: (err) => {
          this.error.set(err?.error?.error?.message || 'Gagal memperbarui data karyawan');
          this.loading.set(false);
        },
      });
    } else {
      const raw = this.form.value;
      const payload = {
        ...raw,
        nominalUpah: Number(raw.nominalUpah),
        nominalUpahLembur: Number(raw.nominalUpahLembur),
        pengaliLembur: raw.pengaliLembur ? Number(raw.pengaliLembur) : null,
      };
      this.employeeService.create(payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/karyawan']);
        },
        error: (err) => {
          this.error.set(err?.error?.error?.message || 'Gagal membuat karyawan baru');
          this.loading.set(false);
        },
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.employeeId) {
      this.router.navigate(['/karyawan', this.employeeId]);
    } else {
      this.router.navigate(['/karyawan']);
    }
  }
}
