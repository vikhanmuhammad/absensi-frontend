import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, startWith, switchMap } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { EmployeeService } from '../../../core/services/employee.service';
import { DivisionService } from '../../../core/services/division.service';
import { AuthService } from '../../../core/services/auth.service';
import { Division, Employee } from '../../../core/models/entities';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private divisionService = inject(DivisionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected auth = inject(AuthService);

  employees = signal<Employee[]>([]);
  divisions = signal<Division[]>([]);
  loading = signal(true);

  filterForm = this.fb.nonNullable.group({
    search: [''],
    divisiId: [''],
    statusKaryawan: [''],
  });

  canCreate = false;

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
            divisiId: value.divisiId || undefined,
            statusKaryawan: (value.statusKaryawan as Employee['statusKaryawan']) || undefined,
          }),
        ),
      )
      .subscribe({
        next: (data) => {
          this.employees.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  goToCreate() {
    this.router.navigate(['/karyawan/tambah']);
  }
}
