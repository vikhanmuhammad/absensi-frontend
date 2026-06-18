import { Component, computed, input } from '@angular/core';

export type IconName =
  | 'grid'
  | 'clock'
  | 'calendar'
  | 'file-check'
  | 'clock-plus'
  | 'check-circle'
  | 'users'
  | 'id-card'
  | 'briefcase'
  | 'user-check'
  | 'clipboard-list'
  | 'clipboard-edit'
  | 'user-plus'
  | 'timetable'
  | 'bar-chart'
  | 'bell'
  | 'user-circle'
  | 'building'
  | 'sliders'
  | 'menu'
  | 'close'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'logout';

// Pemetaan nama ikon abstrak -> class Remixicon (https://remixicon.com), supaya pemakaian
// <app-icon name="..."> di seluruh aplikasi tidak perlu berubah jika suatu saat ganti icon set.
const ICON_MAP: Record<IconName, string> = {
  grid: 'ri-dashboard-line',
  clock: 'ri-time-line',
  calendar: 'ri-history-line',
  'file-check': 'ri-suitcase-line',
  'clock-plus': 'ri-timer-line',
  'check-circle': 'ri-checkbox-circle-line',
  users: 'ri-team-line',
  'id-card': 'ri-user-settings-line',
  briefcase: 'ri-briefcase-line',
  'user-check': 'ri-user-add-line',
  'clipboard-list': 'ri-clipboard-line',
  'clipboard-edit': 'ri-clipboard-line',
  'user-plus': 'ri-user-add-line',
  timetable: 'ri-calendar-event-line',
  'bar-chart': 'ri-bar-chart-line',
  bell: 'ri-notification-line',
  'user-circle': 'ri-user-line',
  building: 'ri-building-line',
  sliders: 'ri-settings-3-line',
  menu: 'ri-menu-line',
  close: 'ri-close-line',
  'chevron-left': 'ri-arrow-left-s-line',
  'chevron-right': 'ri-arrow-right-s-line',
  'chevron-down': 'ri-arrow-down-s-line',
  logout: 'ri-logout-box-r-line',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  name = input.required<IconName>();
  size = input(20);

  iconClass = computed(() => ICON_MAP[this.name()] ?? 'ri-question-line');
}
