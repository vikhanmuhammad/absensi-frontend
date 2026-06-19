import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'outline' = 'primary';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Output() btnClick = new EventEmitter<void>();
  /** Jika diisi, render sebagai <a routerLink> (navigasi) bukan <button> — untuk tombol yang berfungsi sebagai link. */
  @Input() routerLink?: string | unknown[];
}
