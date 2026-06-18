import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService, Role } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent, IconName } from '../../shared/components/icon/icon.component';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
  roles: Role[];
}

const SIDEBAR_COLLAPSED_KEY = 'absensi:sidebarCollapsed';
const MOBILE_BREAKPOINT = 768;

// Daftar menu sidebar didefinisikan SEKALI di sini (lihat docs/copilot-guides/frontend-guide.md "Aturan Konsistensi").
// Detail Karyawan, Detail Projek, dan Request Manpower sengaja tidak ditaruh di sini karena memerlukan
// parameter :id dari halaman daftar/induknya — diakses lewat routerLink kontekstual, bukan menu statis.
const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'grid', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  { path: '/absensi', label: 'Absensi Harian', icon: 'clock', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
  {
    path: '/absensi/riwayat',
    label: 'Riwayat Absensi',
    icon: 'calendar',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
  },
  {
    path: '/pengajuan/cuti',
    label: 'Pengajuan Cuti',
    icon: 'file-check',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
  },
  {
    path: '/pengajuan/lembur',
    label: 'Pengajuan Lembur',
    icon: 'clock-plus',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
  },
  {
    path: '/approval/pengajuan',
    label: 'Approval Pengajuan',
    icon: 'check-circle',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'],
  },
  { path: '/karyawan', label: 'Data Karyawan', icon: 'users', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  { path: '/akun', label: 'Manajemen Akun', icon: 'id-card', roles: ['SUPER_ADMIN', 'HRD'] },
  {
    path: '/projek',
    label: 'Daftar Projek',
    icon: 'briefcase',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
  },
  {
    path: '/approval/manpower',
    label: 'Approval Manpower',
    icon: 'user-check',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'],
  },
  { path: '/penugasan/riwayat', label: 'Riwayat Penugasan', icon: 'clipboard-list', roles: ['SUPER_ADMIN', 'HRD'] },
  { path: '/laporan', label: 'Laporan Absensi', icon: 'bar-chart', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
  {
    path: '/notifikasi',
    label: 'Notifikasi',
    icon: 'bell',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
  },
  {
    path: '/profil',
    label: 'Profil Saya',
    icon: 'user-circle',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
  },
  { path: '/divisi', label: 'Manajemen Divisi', icon: 'building', roles: ['SUPER_ADMIN', 'HRD'] },
  { path: '/pengaturan', label: 'Pengaturan Sistem', icon: 'sliders', roles: ['SUPER_ADMIN'] },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  host: {
    '[class.collapsed]': 'collapsed()',
    '[class.mobile-open]': 'mobileOpen()',
  },
})
export class AppShellComponent implements OnInit, OnDestroy {
  protected auth = inject(AuthService);
  protected notifications = inject(NotificationService);
  private router = inject(Router);

  collapsed = signal(this.readCollapsedPreference());
  mobileOpen = signal(false);

  private routerSub?: Subscription;

  ngOnInit() {
    this.notifications.list().subscribe();

    // Tutup sidebar mobile otomatis setiap kali pindah halaman (back/forward/klik link).
    this.routerSub = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.mobileOpen.set(false);
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
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

  /** Satu tombol di topbar: di mobile membuka/menutup drawer, di desktop collapse/expand ke mode ikon saja. */
  toggleSidebar() {
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      this.mobileOpen.update((v) => !v);
      return;
    }
    this.collapsed.update((v) => {
      const next = !v;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  closeMobileSidebar() {
    this.mobileOpen.set(false);
  }

  private readCollapsedPreference(): boolean {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  }

  logout() {
    this.auth.logout().subscribe();
  }
}
