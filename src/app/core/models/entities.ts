import { Role } from '../services/auth.service';

export type StatusKaryawan = 'TETAP' | 'KONTRAK' | 'HARIAN';
export type SatuanUpah = 'PER_BULAN' | 'PER_JAM';
export type JenisKelamin = 'L' | 'P';

export interface Division {
  id: string;
  namaDivisi: string;
  supervisorEmployeeId: string | null;
  supervisor?: Employee | null;
  _count?: { employees: number };
}

export interface Employee {
  id: string;
  userId: string;
  nik: string;
  namaLengkap: string;
  email: string;
  noHp: string;
  alamat: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin;
  statusPernikahan: string;
  fotoUrl: string | null;
  jabatan: string;
  divisiId: string;
  divisi?: Division;
  statusKaryawan: StatusKaryawan;
  tanggalMulaiKerja: string;
  tanggalAkhirKontrak: string | null;
  nominalUpah: string;
  satuanUpah: SatuanUpah;
  nominalUpahLembur: string;
  pengaliLembur: string | null;
  statusAktif: boolean;
  user?: { username: string; role: Role; statusAktif: boolean };
}

export type ProjectStatus = 'AKTIF' | 'SELESAI' | 'DIBATALKAN';

export interface Project {
  id: string;
  namaProjek: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  deskripsi: string | null;
  spvProjectEmployeeId: string;
  spvProject?: Employee;
  status: ProjectStatus;
  createdByUserId: string;
  _count?: { assignments: number };
  assignments?: ProjectAssignment[];
  manpowerRequests?: ManpowerRequest[];
}

export type ManpowerMode = 'SPESIFIK' | 'HEADCOUNT';
export type ManpowerStatus = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';

export interface ManpowerRequest {
  id: string;
  projectId: string;
  project?: Project;
  divisiAsalId: string;
  divisiAsal?: Division;
  mode: ManpowerMode;
  employeeId: string | null;
  employee?: Employee | null;
  jumlahDiminta: number | null;
  kriteria: string | null;
  tanggalMulaiPenugasan: string;
  tanggalAkhirPenugasan: string;
  status: ManpowerStatus;
  approvedByUserId: string | null;
  approvedAt: string | null;
}

export type AssignmentStatus = 'AKTIF' | 'SELESAI' | 'DIBATALKAN';

export interface ProjectAssignment {
  id: string;
  employeeId: string;
  employee?: Employee;
  projectId: string;
  project?: Project;
  manpowerRequestId: string | null;
  tanggalMulai: string;
  tanggalBerakhir: string;
  status: AssignmentStatus;
}

export type LokasiKerja = 'KANTOR' | 'LAINNYA';
export type StatusKehadiran = 'TEPAT_WAKTU' | 'TERLAMBAT' | 'ALFA' | 'PULANG_CEPAT';

export interface Attendance {
  id: string;
  employeeId: string;
  tanggal: string;
  jamMasuk: string | null;
  jamKeluar: string | null;
  namaProjekAktivitas: string;
  lokasiKerja: LokasiKerja;
  lokasiLainnyaDetail: string | null;
  latitude?: string | null;
  longitude?: string | null;
  statusKehadiran: StatusKehadiran;
  inputByUserId: string | null;
  deskripsiInputMassal: string | null;
  employee?: { namaLengkap: string; divisiId: string; divisi: { namaDivisi: string } };
}

export type JenisCuti = 'IZIN' | 'CUTI_TAHUNAN' | 'SAKIT' | 'MELAHIRKAN';
export type LeaveStatus = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Employee;
  jenisCuti: JenisCuti;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  dokumenPendukungUrl: string | null;
  status: LeaveStatus;
  approvedByUserId: string | null;
  approvedAt: string | null;
}

export type OvertimeJenis = 'INDIVIDUAL' | 'MASSAL';
export type OvertimeStatus = 'DIAJUKAN' | 'DISETUJUI' | 'DITOLAK' | 'DICATAT_OTOMATIS';

export interface OvertimeRequest {
  id: string;
  employeeId: string | null;
  jenis: OvertimeJenis;
  tanggal: string;
  deskripsiAlasan: string;
  status: OvertimeStatus;
  inputByUserId: string | null;
}

export type NotifJenis = 'PENGAJUAN' | 'STATUS_APPROVAL' | 'SISTEM';

export interface AppNotification {
  id: string;
  userId: string;
  judul: string;
  pesan: string;
  jenis: NotifJenis;
  referensiId: string | null;
  sudahDibaca: boolean;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  role: Role;
  superAdminType: 'DIREKTUR' | 'IT_MAINTENANCE' | null;
  statusAktif: boolean;
  lastActiveAt: string | null;
  employee: { namaLengkap: string; jabatan: string } | null;
}

export interface DashboardSummary {
  totalKaryawanAktif: number;
  hadirHariIni: number;
  terlambatHariIni: number;
  alfaHariIni: number;
  cutiAktif: number;
}

export interface AttendanceReportRow {
  divisiId: string;
  namaDivisi: string;
  hadir: number;
  terlambat: number;
  alfa: number;
}

export interface AttendanceReport {
  totalRecords: number;
  perDivisi: AttendanceReportRow[];
}
