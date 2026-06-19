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

interface NavGroup {
  label: string;
  icon: IconName;
  roles: Role[];
  children: NavItem[];
}

const SIDEBAR_COLLAPSED_KEY = 'absensi:sidebarCollapsed';
const MOBILE_BREAKPOINT = 768;

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Dashboard',
    icon: 'grid',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'],
    children: [
      { path: '/dashboard', label: 'Dashboard', icon: 'grid', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
    ],
  },
  {
    label: 'Absensi',
    icon: 'clock',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
    children: [
      { path: '/absensi', label: 'Absensi Harian', icon: 'clock', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
      { path: '/absensi/riwayat', label: 'Riwayat Absensi', icon: 'calendar', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
      { path: '/absensi/massal', label: 'Input Absensi Massal', icon: 'clipboard-edit', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
    ],
  },
  {
    label: 'Pengajuan',
    icon: 'file-check',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
    children: [
      { path: '/pengajuan/cuti', label: 'Cuti / Izin', icon: 'file-check', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
      { path: '/pengajuan/lembur', label: 'Lembur Individual', icon: 'clock-plus', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
      { path: '/pengajuan/lembur-massal', label: 'Lembur Massal', icon: 'timetable', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
    ],
  },
  {
    label: 'Approval',
    icon: 'check-circle',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'],
    children: [
      { path: '/approval/pengajuan', label: 'Approval Cuti/Izin', icon: 'check-circle', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
      { path: '/approval/lembur', label: 'Approval Lembur', icon: 'clock-plus', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
      { path: '/approval/manpower', label: 'Approval Manpower', icon: 'user-check', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
    ],
  },
  {
    label: 'Karyawan & Akun',
    icon: 'users',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'],
    children: [
      { path: '/karyawan', label: 'Data Karyawan', icon: 'users', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
      { path: '/akun', label: 'Manajemen Akun', icon: 'id-card', roles: ['SUPER_ADMIN', 'HRD'] },
      { path: '/divisi', label: 'Manajemen Divisi', icon: 'building', roles: ['SUPER_ADMIN', 'HRD'] },
    ],
  },
  {
    label: 'Projek',
    icon: 'briefcase',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
    children: [
      { path: '/projek', label: 'Daftar Projek', icon: 'briefcase', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
      { path: '/penugasan/riwayat', label: 'Riwayat Penugasan', icon: 'clipboard-list', roles: ['SUPER_ADMIN', 'HRD'] },
    ],
  },
  {
    label: 'Laporan',
    icon: 'bar-chart',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'],
    children: [
      { path: '/laporan', label: 'Laporan Absensi', icon: 'bar-chart', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR'] },
    ],
  },
  {
    label: 'Profil & Pengaturan',
    icon: 'user-circle',
    roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'],
    children: [
      { path: '/profil', label: 'Profil Saya', icon: 'user-circle', roles: ['SUPER_ADMIN', 'HRD', 'SUPERVISOR', 'KARYAWAN'] },
      { path: '/pengaturan', label: 'Pengaturan Sistem', icon: 'sliders', roles: ['SUPER_ADMIN'] },
    ],
  },
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
  openGroups = signal<Set<string>>(new Set());
  hoverGroupLabel = signal<string | null>(null);
  hoverGroupTop = signal(0);

  onGroupHover(event: MouseEvent, label: string) {
    if (!this.collapsed()) return;
    const btn = (event.currentTarget as HTMLElement).querySelector('.nav-group-parent');
    if (btn) {
      const rect = btn.getBoundingClientRect();
      this.hoverGroupTop.set(rect.top);
    }
    this.hoverGroupLabel.set(label);
  }

  onGroupLeave() {
    this.hoverGroupLabel.set(null);
  }

  onGroupClick(event: MouseEvent, group: NavGroup) {
    if (this.collapsed()) {
      // In collapsed mode, toggle is useless — navigate to first child instead
      this.router.navigate([group.children[0].path]);
    } else {
      this.toggleGroup(group.label);
    }
  }

  private routerSub?: Subscription;

  ngOnInit() {
    this.notifications.list().subscribe();

    // Buka grup yang mengandung rute aktif saat init
    this.syncOpenGroups();

    // Tutup sidebar mobile otomatis setiap kali pindah halaman.
    this.routerSub = this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.mobileOpen.set(false);
      this.hoverGroupLabel.set(null);
      this.syncOpenGroups();
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  navGroups = computed(() => {
    const user = this.auth.currentUser();
    const role = user?.role;
    if (!role) return [];
    const isHarian = user?.employee?.statusKaryawan === 'HARIAN';
    return NAV_GROUPS
      .filter((g) => g.roles.includes(role))
      .filter((g) => {
        // Karyawan harian tidak boleh akses pengajuan cuti/lembur
        if (isHarian && g.label === 'Pengajuan') return false;
        return true;
      })
      .map((g) => ({
        ...g,
        children: g.children.filter((c) => c.roles.includes(role)),
      }));
  });

  displayName = computed(
    () => this.auth.currentUser()?.employee?.namaLengkap || this.auth.currentUser()?.username || '',
  );

  avatarInitial = computed(() => (this.displayName().charAt(0) || '?').toUpperCase());

  get pageTitle(): string {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return (route.data?.['title'] as string) || 'Absensi';
  }

  hasActiveChild(group: NavGroup): boolean {
    const url = this.router.url;
    return group.children.some((c) => url.startsWith(c.path));
  }

  isGroupOpen(label: string): boolean {
    return this.openGroups().has(label);
  }

  toggleGroup(label: string) {
    this.openGroups.update((set) => {
      const next = new Set(set);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

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

  logout() {
    this.auth.logout().subscribe();
  }

  private syncOpenGroups() {
    const url = this.router.url;
    const open = new Set<string>();
    for (const group of NAV_GROUPS) {
      if (group.children.some((c) => url.startsWith(c.path))) {
        open.add(group.label);
      }
    }
    // Dashboard: selalu buka karena single-child
    if (url.startsWith('/dashboard')) open.add('Dashboard');
    this.openGroups.set(open);
  }

  private readCollapsedPreference(): boolean {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  }
}
