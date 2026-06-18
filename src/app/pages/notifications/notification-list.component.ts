import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification, NotifJenis } from '../../core/models/entities';

const ICON: Record<NotifJenis, string> = {
  PENGAJUAN: '📋',
  STATUS_APPROVAL: '✅',
  SISTEM: '⏰',
};

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [DatePipe, CardComponent, ButtonComponent],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
})
export class NotificationListComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<AppNotification[]>([]);
  loading = signal(true);

  unreadCount = computed(() => this.notifications().filter((n) => !n.sudahDibaca).length);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.notificationService.list().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markAsRead(item: AppNotification) {
    if (item.sudahDibaca) return;
    this.notificationService.markAsRead(item.id).subscribe(() => {
      this.notifications.update((list) =>
        list.map((n) => (n.id === item.id ? { ...n, sudahDibaca: true } : n)),
      );
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update((list) => list.map((n) => ({ ...n, sudahDibaca: true })));
    });
  }

  icon(jenis: NotifJenis) {
    return ICON[jenis];
  }
}
