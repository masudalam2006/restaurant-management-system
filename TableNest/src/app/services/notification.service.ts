import { Injectable, signal } from '@angular/core';

export interface Toast { id: number; type: 'success' | 'error' | 'info'; message: string; }

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string) { this.push('success', message); }
  error(message: string) { this.push('error', message); }
  info(message: string) { this.push('info', message); }

  dismiss(id: number) { this.toasts.update((t) => t.filter((x) => x.id !== id)); }

  private push(type: Toast['type'], message: string) {
    const id = ++this.counter;
    this.toasts.update((t) => [...t, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 3500);
  }
}
