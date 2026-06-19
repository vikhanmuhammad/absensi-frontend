import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { ManpowerStatus, Project, ProjectStatus } from '../../../core/models/entities';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  AKTIF: 'Aktif',
  SELESAI: 'Selesai',
  DIBATALKAN: 'Dibatalkan',
};
const STATUS_VARIANT: Record<ProjectStatus, BadgeVariant> = {
  AKTIF: 'success',
  SELESAI: 'muted',
  DIBATALKAN: 'danger',
};
const MANPOWER_STATUS_VARIANT: Record<ManpowerStatus, BadgeVariant> = {
  MENUNGGU: 'warning',
  DISETUJUI: 'success',
  DITOLAK: 'danger',
};

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [DatePipe, CardComponent, BadgeComponent, ButtonComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  protected auth = inject(AuthService);

  project = signal<Project | null>(null);
  loading = signal(true);
  projectId = '';

  isSpvOfThisProject = computed(() => {
    const employeeId = this.auth.currentUser()?.employee?.id;
    return !!employeeId && employeeId === this.project()?.spvProjectEmployeeId;
  });

  canExport = computed(() => ['SUPER_ADMIN', 'HRD'].includes(this.auth.currentUser()?.role ?? '') || this.isSpvOfThisProject());

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.projectId = id;

    this.projectService.getById(Number(id)).subscribe({
      next: (data) => {
        this.project.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  print() {
    window.print();
  }

  statusLabel(status: ProjectStatus) {
    return STATUS_LABEL[status];
  }

  statusVariant(status: ProjectStatus): BadgeVariant {
    return STATUS_VARIANT[status];
  }

  manpowerVariant(status: ManpowerStatus): BadgeVariant {
    return MANPOWER_STATUS_VARIANT[status];
  }
}
