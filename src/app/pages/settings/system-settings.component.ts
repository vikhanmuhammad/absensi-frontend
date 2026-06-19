import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { UserService } from '../../core/services/user.service';
import { SettingsService } from '../../core/services/settings.service';
import { UserAccount } from '../../core/models/entities';
import { extractErrorMessage } from '../../core/models/api-envelope';

interface Holiday {
  tanggal: string;
  keterangan: string;
}

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './system-settings.component.html',
  styleUrl: './system-settings.component.scss',
})
export class SystemSettingsComponent implements OnInit {
  private userService = inject(UserService);
  private settingsService = inject(SettingsService);
  private fb = inject(FormBuilder);

  superAdmins = signal<UserAccount[]>([]);
  savedMessage = signal('');
  errorMessage = signal('');
  loadingSettings = signal(true);
  savingWorkHours = signal(false);

  // Belum ada model Holiday di backend — bagian ini masih bersifat lokal (tidak persisten) untuk versi ini.
  holidays = signal<Holiday[]>([
    { tanggal: '2026-01-01', keterangan: 'Tahun Baru Masehi' },
    { tanggal: '2026-05-29', keterangan: 'Hari Raya Waisak' },
    { tanggal: '2026-08-17', keterangan: 'Hari Kemerdekaan RI' },
    { tanggal: '2026-12-25', keterangan: 'Hari Raya Natal' },
  ]);

  workHoursForm = this.fb.nonNullable.group({
    jamMasuk: ['08:00'],
    jamPulang: ['17:00'],
    batasTerlambat: ['08:00'],
    batasAlfa: ['12:00'],
  });

  securityForm = this.fb.nonNullable.group({
    sessionTimeout: ['7'],
    backupSchedule: ['harian'],
  });

  ngOnInit() {
    this.userService.list().subscribe((data) => this.superAdmins.set(data.filter((u) => u.role === 'SUPER_ADMIN')));

    this.loadingSettings.set(true);
    this.settingsService.get().subscribe({
      next: (settings) => {
        this.workHoursForm.patchValue({
          jamMasuk: settings.jamMasukStandar,
          jamPulang: settings.jamPulangStandar,
          batasTerlambat: settings.batasTerlambat,
          batasAlfa: settings.batasAlfa,
        });
        this.loadingSettings.set(false);
      },
      error: () => this.loadingSettings.set(false),
    });
  }

  saveWorkHours() {
    this.savingWorkHours.set(true);
    this.savedMessage.set('');
    this.errorMessage.set('');
    const value = this.workHoursForm.getRawValue();

    this.settingsService
      .update({
        jamMasukStandar: value.jamMasuk,
        jamPulangStandar: value.jamPulang,
        batasTerlambat: value.batasTerlambat,
        batasAlfa: value.batasAlfa,
      })
      .subscribe({
        next: () => {
          this.savingWorkHours.set(false);
          this.savedMessage.set('Pengaturan jam kerja berhasil disimpan dan langsung berlaku untuk kalkulasi absensi.');
        },
        error: (err) => {
          this.savingWorkHours.set(false);
          this.errorMessage.set(extractErrorMessage(err, 'Gagal menyimpan pengaturan jam kerja'));
        },
      });
  }

  saveSecurity() {
    this.savedMessage.set('Pengaturan keamanan tersimpan secara lokal (belum terhubung ke backend pada versi ini).');
  }
}
