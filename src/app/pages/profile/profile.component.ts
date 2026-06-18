import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/entities';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  protected auth = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);

  employee = signal<Employee | null>(null);
  loading = signal(true);
  submitting = signal(false);
  infoMessage = signal('');

  initial = computed(() => {
    const name = this.auth.currentUser()?.employee?.namaLengkap || this.auth.currentUser()?.username || '?';
    return name.charAt(0).toUpperCase();
  });

  form = this.fb.nonNullable.group({
    passwordBaru: ['', [Validators.required, Validators.minLength(8)]],
    konfirmasiPasswordBaru: ['', Validators.required],
  });

  ngOnInit() {
    const employeeId = this.auth.currentUser()?.employee?.id;
    if (!employeeId) {
      this.loading.set(false);
      return;
    }

    this.employeeService.getById(employeeId).subscribe({
      next: (data) => {
        this.employee.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submitPasswordChange() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.form.controls.passwordBaru.value !== this.form.controls.konfirmasiPasswordBaru.value) {
      this.infoMessage.set('Konfirmasi kata sandi tidak sama dengan kata sandi baru.');
      return;
    }

    // Belum ada endpoint pengajuan perubahan password (FR-MAK-02) di backend saat ini.
    this.infoMessage.set(
      'Fitur pengajuan perubahan password belum terhubung ke backend pada versi ini. Hubungi HRD untuk reset manual.',
    );
    this.form.reset({ passwordBaru: '', konfirmasiPasswordBaru: '' });
  }
}
