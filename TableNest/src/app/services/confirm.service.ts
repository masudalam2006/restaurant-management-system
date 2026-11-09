import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  title: string;
  message: string;
  confirmText: string;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  ask(message: string, title = 'Please confirm', confirmText = 'Delete'): Promise<boolean> {
    return new Promise((resolve) => this.state.set({ title, message, confirmText, resolve }));
  }

  answer(value: boolean) {
    const s = this.state();
    this.state.set(null);
    s?.resolve(value);
  }
}
