import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subscription, interval } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AttendanceService } from '../../../core/services/attendance.service';
import { Attendance, LokasiKerja, StatusKehadiran } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

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

@Component({
  selector: 'app-attendance-clock',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent, IconComponent],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.scss',
})
export class AttendanceClockComponent implements OnInit, OnDestroy {
  private attendanceService = inject(AttendanceService);
  private fb = inject(FormBuilder);

  today = signal<Attendance | null>(null);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');
  now = signal(new Date());

  private clockSub?: Subscription;

  form = this.fb.nonNullable.group({
    namaProjekAktivitas: [''],
    lokasiKerja: ['KANTOR' as LokasiKerja],
    lokasiLainnyaDetail: [''],
  });

  hasClockedIn = computed(() => !!this.today()?.jamMasuk);
  hasClockedOut = computed(() => !!this.today()?.jamKeluar);

  ngOnInit() {
    this.clockSub = interval(1000).subscribe(() => this.now.set(new Date()));
    this.refresh();
  }

  ngOnDestroy() {
    this.clockSub?.unsubscribe();
  }

  refresh() {
    this.loading.set(true);
    this.attendanceService.today().subscribe({
      next: (data) => {
        this.today.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private getLocation(): Promise<{ latitude?: number; longitude?: number }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({});
        return;
      }
      const timer = setTimeout(() => resolve({}), 4000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => {
          clearTimeout(timer);
          resolve({});
        },
        { timeout: 4000 },
      );
    });
  }

  async clockIn() {
    if (!this.form.controls.namaProjekAktivitas.value) {
      this.errorMessage.set('Nama project/aktivitas wajib diisi');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');
    const location = await this.getLocation();
    const { namaProjekAktivitas, lokasiKerja, lokasiLainnyaDetail } = this.form.getRawValue();

    this.attendanceService
      .clockIn({
        namaProjekAktivitas,
        lokasiKerja,
        lokasiLainnyaDetail: lokasiLainnyaDetail || undefined,
        ...location,
      })
      .subscribe({
        next: (data) => {
          this.today.set(data);
          this.submitting.set(false);
        },
        error: (err) => {
          this.errorMessage.set(extractErrorMessage(err, 'Gagal melakukan absen masuk'));
          this.submitting.set(false);
        },
      });
  }

  async clockOut() {
    this.submitting.set(true);
    this.errorMessage.set('');
    const location = await this.getLocation();

    this.attendanceService.clockOut(location).subscribe({
      next: (data) => {
        this.today.set(data);
        this.submitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal melakukan absen pulang'));
        this.submitting.set(false);
      },
    });
  }

  statusLabel(status: StatusKehadiran) {
    return STATUS_LABEL[status];
  }

  statusVariant(status: StatusKehadiran): BadgeVariant {
    return STATUS_VARIANT[status];
  }
}
