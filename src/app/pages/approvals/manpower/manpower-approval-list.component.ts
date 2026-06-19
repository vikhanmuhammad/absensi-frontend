import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ManpowerRequestService } from '../../../core/services/manpower-request.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { Employee, ManpowerRequest } from '../../../core/models/entities';
import { extractErrorMessage } from '../../../core/models/api-envelope';

@Component({
  selector: 'app-manpower-approval-list',
  standalone: true,
  imports: [DatePipe, FormsModule, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './manpower-approval-list.component.html',
  styleUrl: './manpower-approval-list.component.scss',
})
export class ManpowerApprovalListComponent implements OnInit {
  private manpowerRequestService = inject(ManpowerRequestService);
  private employeeService = inject(EmployeeService);
  protected auth = inject(AuthService);

  pending = signal<ManpowerRequest[]>([]);
  processed = signal<ManpowerRequest[]>([]);
  loading = signal(true);
  errorMessage = signal('');
  actingId = signal<number | null>(null);
  candidatesByDivisi = new Map<number, Employee[]>();
  selectedEmployee = new Map<number, number>();

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    const role = this.auth.currentUser()?.role;
    // Supervisor otomatis dibatasi ke divisinya sendiri; HRD/Super Admin melihat semua divisi.
    const divisiId = role === 'SUPERVISOR' ? this.auth.currentUser()?.employee?.divisiId : undefined;

    this.manpowerRequestService.listPending(divisiId).subscribe({
      next: (data) => {
        this.pending.set(data);
        this.loading.set(false);
        for (const item of data) {
          if (item.mode === 'HEADCOUNT' && !this.candidatesByDivisi.has(item.divisiAsalId)) {
            this.employeeService
              .list({ divisiId: item.divisiAsalId })
              .subscribe((emps) => this.candidatesByDivisi.set(item.divisiAsalId, emps));
          }
        }
      },
      error: () => this.loading.set(false),
    });
  }

  candidatesFor(divisiId: number): Employee[] {
    return this.candidatesByDivisi.get(divisiId) ?? [];
  }

  approve(item: ManpowerRequest) {
    const employeeId = item.mode === 'HEADCOUNT' ? this.selectedEmployee.get(item.id) : undefined;
    if (item.mode === 'HEADCOUNT' && !employeeId) {
      this.errorMessage.set('Pilih karyawan yang akan ditugaskan terlebih dahulu.');
      return;
    }

    this.actingId.set(item.id);
    this.errorMessage.set('');
    this.manpowerRequestService.approve(item.id, employeeId).subscribe({
      next: (updated) => {
        this.pending.update((list) => list.filter((x) => x.id !== item.id));
        this.processed.update((list) => [updated, ...list].slice(0, 10));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal menyetujui request manpower'));
        this.actingId.set(null);
      },
    });
  }

  reject(item: ManpowerRequest) {
    if (!confirm(`Tolak request manpower untuk projek "${item.project?.namaProjek}"?`)) return;

    this.actingId.set(item.id);
    this.errorMessage.set('');
    this.manpowerRequestService.reject(item.id).subscribe({
      next: (updated) => {
        this.pending.update((list) => list.filter((x) => x.id !== item.id));
        this.processed.update((list) => [updated, ...list].slice(0, 10));
        this.actingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'Gagal menolak request manpower'));
        this.actingId.set(null);
      },
    });
  }
}
