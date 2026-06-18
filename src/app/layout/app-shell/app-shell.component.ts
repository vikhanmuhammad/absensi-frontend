import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, Role } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface NavItem {
  path: string;
  label: string;
  roles: Role[];
}

// Daftar menu sidebar didefinisikan SEKALI di sini (lihat docs/copilot-guides/frontend-guide.md "Aturan Konsistensi").
// Detail Karyawan, Detail Projek, dan Request Manpower sengaja tidak ditaruh di sini karena memerlukan
// parameter :id dari halaman daftar/induknya — diakses lewat routerLink kontekstual, bukan menu statis.
const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  { path: '/absensi', label: 'Absensi Harian', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  { path: '/absensi/riwayat', label: 'Riwayat Absensi', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  { path: '/pengajuan/cuti', label: 'Pengajuan Cuti', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  { path: '/pengajuan/lembur', label: 'Pengajuan Lembur', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  { path: '/approval/pengajuan', label: 'Approval Pengajuan', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  { path: '/karyawan', label: 'Data Karyawan', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  { path: '/akun', label: 'Manajemen Akun', roles: ['SUPER_ADMIN', 'HRD'] },
  { path: '/projek', label: 'Daftar Projek', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  { path: '/approval/manpower', label: 'Approval Manpower', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  { path: '/penugasan/riwayat', label: 'Riwayat Penugasan', roles: ['SUPER_ADMIN', 'HRD'] },
  { path: '/laporan', label: 'Laporan Absensi', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  { path: '/notifikasi', label: 'Notifikasi', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  { path: '/profil', label: 'Profil Saya', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  { path: '/divisi', label: 'Manajemen Divisi', roles: ['SUPER_ADMIN', 'HRD'] },
  { path: '/pengaturan', label: 'Pengaturan Sistem', roles: ['SUPER_ADMIN'] },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  protected auth = inject(AuthService);
  protected notifications = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    this.notifications.list().subscribe();
  }

  navItems = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (!role) return [];
    return NAV_ITEMS.filter((item) => item.roles.includes(role));
  });

  displayName = computed(
    () => this.auth.currentUser()?.employee?.namaLengkap || this.auth.currentUser()?.username || '',
  );

  avatarInitial = computed(() => (this.displayName().charAt(0) || '?').toUpperCase());

  // TODO: untuk judul topbar yang lebih reaktif, pertimbangkan toSignal(router.events) —
  // getter ini sudah cukup karena Angular Router memicu change detection setiap navigasi.
  get pageTitle(): string {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return (route.data?.['title'] as string) || 'Absensi';
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
