import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { UserService } from '../../core/services/user.service';
import { UserAccount } from '../../core/models/entities';

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
  private fb = inject(FormBuilder);

  superAdmins = signal<UserAccount[]>([]);
  savedMessage = signal('');

  // Belum ada model Settings/Holiday di backend — form ini bersifat lokal (tidak persisten) untuk versi ini.
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
  }

  saveWorkHours() {
    this.savedMessage.set('Pengaturan jam kerja tersimpan secara lokal (belum terhubung ke backend pada versi ini).');
  }

  saveSecurity() {
    this.savedMessage.set('Pengaturan keamanan tersimpan secara lokal (belum terhubung ke backend pada versi ini).');
  }
}
