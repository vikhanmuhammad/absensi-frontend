import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { UserService } from '../../core/services/user.service';
import { UserAccount } from '../../core/models/entities';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [DatePipe, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './account-management.component.html',
  styleUrl: './account-management.component.scss',
})
export class AccountManagementComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<UserAccount[]>([]);
  loading = signal(true);
  actingId = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.userService.list().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleActive(user: UserAccount) {
    const next = !user.statusAktif;
    if (!confirm(`${next ? 'Aktifkan' : 'Nonaktifkan'} akun ${user.username}?`)) return;

    this.actingId.set(user.id);
    this.userService.setActive(user.id, next).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.actingId.set(null);
      },
      error: () => this.actingId.set(null),
    });
  }

  roleLabel(user: UserAccount) {
    if (user.role === 'SUPER_ADMIN') {
      return `Super Admin (${user.superAdminType === 'IT_MAINTENANCE' ? 'IT/Maintenance' : 'Direktur'})`;
    }
    const map: Record<string, string> = { HRD: 'HRD', SUPERVISOR: 'Supervisor', KARYAWAN: 'Karyawan' };
    return map[user.role] ?? user.role;
  }
}
