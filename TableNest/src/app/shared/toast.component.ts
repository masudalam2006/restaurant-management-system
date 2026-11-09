import { Component, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="stack no-print" aria-live="polite">
      @for (t of notify.toasts(); track t.id) {
        <div class="toast" [class]="'toast ' + t.type" (click)="notify.dismiss(t.id)">
          <i [class]="icon(t.type)"></i><span>{{ t.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .stack { position: fixed; top: 16px; right: 16px; display: flex; flex-direction: column; gap: 10px; z-index: 300; max-width: calc(100vw - 32px); }
    .toast { display: flex; gap: 10px; align-items: center; padding: 12px 16px; border-radius: 12px; color: #fff; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,.25); cursor: pointer; min-width: 240px; }
    .success { background: #2e9e5b; } .error { background: #d62828; } .info { background: #2b7bd1; }
  `],
})
export class ToastComponent {
  notify = inject(NotificationService);
  icon(type: string) {
    return type === 'success' ? 'fa-solid fa-circle-check' : type === 'error' ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-info';
  }
}
