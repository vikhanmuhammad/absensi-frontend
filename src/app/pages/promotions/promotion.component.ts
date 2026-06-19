import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PromotionService } from '../../core/services/promotion.service';
import { Employee, EmployeePromotion, JenisPromosi, PromotionStatus } from '../../core/models/entities';
import { extractErrorMessage } from '../../core/models/api-envelope';

type Mode = 'perorangan' | 'massal';

const JENIS_OPTIONS: { value: JenisPromosi; label: string }[] = [
  { value: 'HARIAN_KE_KONTRAK', label: 'Harian → Kontrak' },
  { value: 'KONTRAK_KE_TETAP', label: 'Kontrak → Tetap' },
  { value: 'PERPANJANGAN_KONTRAK', label: 'Perpanjangan Kontrak' },
  { value: 'PERUBAHAN_GAJI', label: 'Perubahan Gaji' },
];

const JENIS_LABEL: Record<JenisPromosi, string> = {
  HARIAN_KE_KONTRAK: 'Harian → Kontrak',
  KONTRAK_KE_TETAP: 'Kontrak → Tetap',
  PERPANJANGAN_KONTRAK: 'Perpanjangan Kontrak',
  PERUBAHAN_GAJI: 'Perubahan Gaji',
};

const STATUS_LABEL: Record<PromotionStatus, string> = {
  DIJADWALKAN: 'Dijadwalkan',
  AKTIF: 'Aktif',
  DIBATALKAN: 'Dibatalkan',
};

const STATUS_VARIANT: Record<PromotionStatus, BadgeVariant> = {
  DIJADWALKAN: 'warning',
  AKTIF: 'success',
  DIBATALKAN: 'danger',
};

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './promotion.component.html',
  styleUrl: './promotion.component.scss',
})
export class PromotionComponent implements OnInit {
  private promotionService = inject(PromotionService);
  private fb = inject(FormBuilder);

  jenisOptions = JENIS_OPTIONS;
  jenisPromosi = signal<JenisPromosi>('HARIAN_KE_KONTRAK');
  mode = signal<Mode>('perorangan');

  eligibleEmployees = signal<Employee[]>([]);
  selectedIds = signal<Set<number>>(new Set());
  loadingEmployees = signal(false);
  searchTerm = signal('');
  dropdownOpen = signal(false);

  filteredEmployees = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.eligibleEmployees();
    if (!term) return list;
    return list.filter(
      (e) =>
        e.namaLengkap.toLowerCase().includes(term) ||
        e.nik.toLowerCase().includes(term) ||
        (e.divisi?.namaDivisi ?? '').toLowerCase().includes(term) ||
        e.jabatan.toLowerCase().includes(term),
    );
  });

  filteredAvailable = computed(() => {
    const selected = this.selectedIds();
    const term = this.searchTerm().toLowerCase().trim();
    const list = this.eligibleEmployees().filter((e) => !selected.has(e.id));
    if (!term) return list;
    return list.filter(
      (e) =>
        e.namaLengkap.toLowerCase().includes(term) ||
        e.nik.toLowerCase().includes(term) ||
        (e.divisi?.namaDivisi ?? '').toLowerCase().includes(term) ||
        e.jabatan.toLowerCase().includes(term),
    );
  });

  history = signal<EmployeePromotion[]>([]);
  loadingHistory = signal(true);

  submitting = signal(false);
  error = signal('');
  success = signal('');
  skippedMessages = signal<string[]>([]);

  showTanggalSelesai = computed(() => this.jenisPromosi() !== 'KONTRAK_KE_TETAP');
  tanggalSelesaiRequired = computed(
    () => this.jenisPromosi() === 'HARIAN_KE_KONTRAK' || this.jenisPromosi() === 'PERPANJANGAN_KONTRAK',
  );
  showKontrakKe = computed(
    () => this.jenisPromosi() === 'KONTRAK_KE_TETAP' || this.jenisPromosi() === 'PERPANJANGAN_KONTRAK',
  );

  form = this.fb.nonNullable.group({
    nominalUpahBaru: ['', [Validators.required, Validators.min(0)]],
    satuanUpahBaru: ['PER_BULAN', Validators.required],
    nominalUpahLemburBaru: ['', [Validators.required, Validators.min(0)]],
    pengaliLemburBaru: [''],
    tanggalMulai: ['', Validators.required],
    tanggalSelesai: [''],
  });

  ngOnInit() {
    this.loadEligible();
    this.loadHistory();
  }

  setJenis(jenis: JenisPromosi) {
    if (this.jenisPromosi() === jenis) return;
    this.jenisPromosi.set(jenis);
    this.form.patchValue({ tanggalSelesai: '' });
    this.searchTerm.set('');
    this.dropdownOpen.set(false);
    this.loadEligible();
  }

  setMode(mode: Mode) {
    this.mode.set(mode);
    this.selectedIds.set(new Set());
    this.searchTerm.set('');
    this.dropdownOpen.set(false);
  }

  onDropdownBlur(event: FocusEvent) {
    const related = event.relatedTarget as HTMLElement | null;
    const current = event.currentTarget as HTMLElement;
    if (related && current.contains(related)) return;
    setTimeout(() => this.dropdownOpen.set(false), 150);
  }

  pickSingle(empId: number) {
    this.selectSingle(empId);
    this.dropdownOpen.set(false);
    const emp = this.eligibleEmployees().find((e) => e.id === empId);
    if (emp) this.searchTerm.set(emp.namaLengkap);
  }

  pickMassal(empId: number) {
    if (!this.isSelected(empId)) {
      this.toggleSelect(empId);
    }
    this.searchTerm.set('');
  }

  private loadEligible() {
    this.loadingEmployees.set(true);
    this.selectedIds.set(new Set());
    this.promotionService.eligible(this.jenisPromosi()).subscribe({
      next: (data) => {
        this.eligibleEmployees.set(data);
        this.loadingEmployees.set(false);
      },
      error: () => this.loadingEmployees.set(false),
    });
  }

  private loadHistory() {
    this.loadingHistory.set(true);
    this.promotionService.list().subscribe({
      next: (data) => {
        this.history.set(data);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }

  selectSingle(id: number) {
    this.selectedIds.set(new Set([id]));
    const emp = this.eligibleEmployees().find((e) => e.id === id);
    if (emp) {
      this.form.patchValue({
        nominalUpahBaru: emp.nominalUpah,
        satuanUpahBaru: emp.satuanUpah,
        nominalUpahLemburBaru: emp.nominalUpahLembur,
        pengaliLemburBaru: emp.pengaliLembur ?? '',
      });
    }
  }

  toggleSelect(id: number) {
    const s = new Set(this.selectedIds());
    if (s.has(id)) s.delete(id);
    else s.add(id);
    this.selectedIds.set(s);
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  getSelectedEmployees(): Employee[] {
    const ids = this.selectedIds();
    return this.eligibleEmployees().filter((e) => ids.has(e.id));
  }

  clearAllSelection() {
    this.selectedIds.set(new Set());
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) {
      this.error.set('Pilih minimal 1 karyawan');
      return;
    }
    if (this.tanggalSelesaiRequired() && !this.form.getRawValue().tanggalSelesai) {
      this.error.set('Tanggal selesai kontrak wajib diisi untuk jenis promosi ini');
      return;
    }

    this.submitting.set(true);
    this.error.set('');
    this.success.set('');
    this.skippedMessages.set([]);

    const value = this.form.getRawValue();

    this.promotionService
      .create({
        employeeIds: ids,
        jenisPromosi: this.jenisPromosi(),
        nominalUpahBaru: Number(value.nominalUpahBaru),
        satuanUpahBaru: value.satuanUpahBaru as Employee['satuanUpah'],
        nominalUpahLemburBaru: Number(value.nominalUpahLemburBaru),
        pengaliLemburBaru: value.pengaliLemburBaru ? Number(value.pengaliLemburBaru) : undefined,
        tanggalMulai: value.tanggalMulai,
        tanggalSelesai: this.showTanggalSelesai() && value.tanggalSelesai ? value.tanggalSelesai : undefined,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.success.set(
            res.dilewati > 0
              ? `${res.berhasil} karyawan berhasil diproses, ${res.dilewati} dilewati.`
              : `${res.berhasil} karyawan berhasil diproses.`,
          );
          this.skippedMessages.set(res.results.filter((r) => !r.ok && r.message).map((r) => r.message as string));
          this.selectedIds.set(new Set());
          this.form.patchValue({ tanggalMulai: '', tanggalSelesai: '' });
          this.loadEligible();
          this.loadHistory();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(extractErrorMessage(err, 'Gagal memproses promosi/perubahan gaji'));
        },
      });
  }

  jenisLabel(jenis: JenisPromosi): string {
    return JENIS_LABEL[jenis];
  }

  statusLabel(status: PromotionStatus): string {
    return STATUS_LABEL[status];
  }

  statusVariant(status: PromotionStatus): BadgeVariant {
    return STATUS_VARIANT[status];
  }
}
