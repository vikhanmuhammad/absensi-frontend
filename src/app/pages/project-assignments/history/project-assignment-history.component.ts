import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, startWith, switchMap } from 'rxjs';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ProjectAssignmentService } from '../../../core/services/project-assignment.service';
import { ProjectService } from '../../../core/services/project.service';
import { DivisionService } from '../../../core/services/division.service';
import { Division, Project, ProjectAssignment } from '../../../core/models/entities';

@Component({
  selector: 'app-project-assignment-history',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, CardComponent, BadgeComponent],
  templateUrl: './project-assignment-history.component.html',
  styleUrl: './project-assignment-history.component.scss',
})
export class ProjectAssignmentHistoryComponent implements OnInit {
  private assignmentService = inject(ProjectAssignmentService);
  private projectService = inject(ProjectService);
  private divisionService = inject(DivisionService);
  private fb = inject(FormBuilder);

  assignments = signal<ProjectAssignment[]>([]);
  projects = signal<Project[]>([]);
  divisions = signal<Division[]>([]);
  loading = signal(true);

  filterForm = this.fb.nonNullable.group({
    search: [''],
    projectId: [''],
    divisiId: [''],
  });

  ngOnInit() {
    this.projectService.list().subscribe((data) => this.projects.set(data));
    this.divisionService.list().subscribe((data) => this.divisions.set(data));

    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.getRawValue()),
        debounceTime(300),
        switchMap((value) =>
          this.assignmentService.history({
            search: value.search || undefined,
            projectId: value.projectId ? Number(value.projectId) : undefined,
            divisiId: value.divisiId ? Number(value.divisiId) : undefined,
          }),
        ),
      )
      .subscribe({
        next: (data) => {
          this.assignments.set(data);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
