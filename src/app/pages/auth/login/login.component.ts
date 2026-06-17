import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="stub-wrap">
      <div class="stub">
        <h1>Login</h1>
        <p>
          Belum diimplementasikan. Gunakan prompt konversi #1 di
          <code>docs/copilot-guides/frontend-guide.md</code> dengan acuan tampilan
          <code>docs/design/login.html</code>.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .stub-wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-family);
        background: var(--color-bg);
      }
      .stub {
        max-width: 420px;
        padding: 24px;
        text-align: center;
        color: var(--color-text);
      }
      code {
        background: var(--color-primary-light);
        color: var(--color-primary-dark);
        padding: 2px 6px;
        border-radius: 4px;
      }
    `,
  ],
})
export class LoginComponent {}
