import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, startWith, switchMap } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { DivisionService } from '../../../core/services/division.service';
import { AuthService } from '../../../core/services/auth.service';
import { Division, Employee, StatusKaryawan } from '../../../core/models/entities';

const TABS: { value: StatusKaryawan; label: string }[] = [
  { value: 'TETAP', label: 'Tetap' },
  { value: 'KONTRAK', label: 'Kontrak' },
  { value: 'HARIAN', label: 'Harian' },
];

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CardComponent, BadgeComponent, ButtonComponent, IconComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private divisionService = inject(DivisionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected auth = inject(AuthService);

  tabs = TABS;
  activeTab = signal<StatusKaryawan>('TETAP');

  allEmployees = signal<Employee[]>([]);
  divisions = signal<Division[]>([]);
  loading = signal(true);

  filterForm = this.fb.nonNullable.group({
    search: [''],
    divisiId: [''],
  });

  canCreate = false;

  employees = computed(() => this.allEmployees().filter((e) => e.statusKaryawan === this.activeTab()));

  tabCounts = computed(() => {
    const list = this.allEmployees();
    const counts: Record<StatusKaryawan, number> = { TETAP: 0, KONTRAK: 0, HARIAN: 0 };
    for (const e of list) counts[e.statusKaryawan]++;
    return counts;
  });

  ngOnInit() {
    this.canCreate = ['SUPER_ADMIN', 'HRD'].includes(this.auth.currentUser()?.role ?? '');

    this.divisionService.list().subscribe((data) => this.divisions.set(data));

    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.getRawValue()),
        debounceTime(300),
        switchMap((value) =>
          this.employeeService.list({
            search: value.search || undefined,
            divisiId: value.divisiId ? Number(value.divisiId) : undefined,
          }),
        ),
      )
      .subscribe({
        next: (data) => {
          this.allEmployees.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  setTab(tab: StatusKaryawan) {
    this.activeTab.set(tab);
  }

  goToCreate() {
    this.router.navigate(['/karyawan/tambah']);
  }
}
