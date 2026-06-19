import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Login — Absensi',
  },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'absensi' },
      {
        path: 'dashboard',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        data: { title: 'Dashboard' },
      },
      {
        path: 'absensi',
        loadComponent: () => import('./pages/attendance/clock/clock.component').then((m) => m.AttendanceClockComponent),
        data: { title: 'Absensi Harian' },
      },
      {
        path: 'absensi/riwayat',
        loadComponent: () =>
          import('./pages/attendance/history/history.component').then((m) => m.AttendanceHistoryComponent),
        data: { title: 'Riwayat Absensi' },
      },
      {
        path: 'absensi/massal',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/attendance/bulk/bulk-attendance.component').then((m) => m.BulkAttendanceComponent),
        data: { title: 'Input Absensi Massal' },
      },
      {
        path: 'pengajuan/cuti',
        loadComponent: () =>
          import('./pages/leave-requests/form/leave-request-form.component').then((m) => m.LeaveRequestFormComponent),
        data: { title: 'Pengajuan Cuti' },
      },
      {
        path: 'pengajuan/lembur',
        loadComponent: () =>
          import('./pages/overtime-requests/form/overtime-request-form.component').then(
            (m) => m.OvertimeRequestFormComponent,
          ),
        data: { title: 'Pengajuan Lembur' },
      },
      {
        path: 'pengajuan/lembur-massal',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/overtime-requests/bulk/bulk-overtime.component').then((m) => m.BulkOvertimeComponent),
        data: { title: 'Lembur Massal' },
      },
      {
        path: 'approval/pengajuan',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/approvals/requests/approval-request-list.component').then(
            (m) => m.ApprovalRequestListComponent,
          ),
        data: { title: 'Approval Pengajuan' },
      },
      {
        path: 'approval/lembur',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/approvals/overtime/overtime-approval-list.component').then(
            (m) => m.OvertimeApprovalListComponent,
          ),
        data: { title: 'Approval Lembur' },
      },
      {
        path: 'karyawan',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/employees/list/employee-list.component').then((m) => m.EmployeeListComponent),
        data: { title: 'Data Karyawan' },
      },
      {
        path: 'karyawan/tambah',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD'])],
        loadComponent: () =>
          import('./pages/employees/form/employee-form.component').then((m) => m.EmployeeFormComponent),
        data: { title: 'Tambah Karyawan' },
      },
      {
        path: 'karyawan/:id',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/employees/detail/employee-detail.component').then((m) => m.EmployeeDetailComponent),
        data: { title: 'Detail Karyawan' },
      },
      {
        path: 'karyawan/:id/edit',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD'])],
        loadComponent: () =>
          import('./pages/employees/form/employee-form.component').then((m) => m.EmployeeFormComponent),
        data: { title: 'Edit Karyawan' },
      },
      {
        path: 'akun',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD'])],
        loadComponent: () =>
          import('./pages/accounts/account-management.component').then((m) => m.AccountManagementComponent),
        data: { title: 'Manajemen Akun' },
      },
      {
        path: 'projek',
        loadComponent: () =>
          import('./pages/projects/list/project-list.component').then((m) => m.ProjectListComponent),
        data: { title: 'Daftar Projek' },
      },
      {
        path: 'projek/:id',
        loadComponent: () =>
          import('./pages/projects/detail/project-detail.component').then((m) => m.ProjectDetailComponent),
        data: { title: 'Detail Projek' },
      },
      {
        path: 'projek/:id/request-manpower',
        loadComponent: () =>
          import('./pages/manpower-requests/form/manpower-request-form.component').then(
            (m) => m.ManpowerRequestFormComponent,
          ),
        data: { title: 'Request Manpower' },
      },
      {
        path: 'approval/manpower',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/approvals/manpower/manpower-approval-list.component').then(
            (m) => m.ManpowerApprovalListComponent,
          ),
        data: { title: 'Approval Manpower' },
      },
      {
        path: 'penugasan/riwayat',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD'])],
        loadComponent: () =>
          import('./pages/project-assignments/history/project-assignment-history.component').then(
            (m) => m.ProjectAssignmentHistoryComponent,
          ),
        data: { title: 'Riwayat Penugasan' },
      },
      {
        path: 'laporan',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD', 'SUPERVISOR'])],
        loadComponent: () =>
          import('./pages/reports/attendance/attendance-report.component').then((m) => m.AttendanceReportComponent),
        data: { title: 'Laporan Absensi' },
      },
      {
        path: 'notifikasi',
        loadComponent: () =>
          import('./pages/notifications/notification-list.component').then((m) => m.NotificationListComponent),
        data: { title: 'Notifikasi' },
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
        data: { title: 'Profil Saya' },
      },
      {
        path: 'divisi',
        canActivate: [roleGuard(['SUPER_ADMIN', 'HRD'])],
        loadComponent: () =>
          import('./pages/divisions/division-management.component').then((m) => m.DivisionManagementComponent),
        data: { title: 'Manajemen Divisi' },
      },
      {
        path: 'pengaturan',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadComponent: () =>
          import('./pages/settings/system-settings.component').then((m) => m.SystemSettingsComponent),
        data: { title: 'Pengaturan Sistem' },
      },
    ],
  },
  { path: '**', redirectTo: 'absensi' },
];
