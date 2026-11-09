import { Component, inject } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (confirm.state(); as s) {
      <div class="modal-backdrop" style="z-index:200" (click)="confirm.answer(false)">
        <div class="modal" style="max-width:420px" role="alertdialog" aria-modal="true" (click)="$event.stopPropagation()">
          <h3>{{ s.title }}</h3>
          <p>{{ s.message }}</p>
          <div class="modal-actions">
            <button class="btn btn-outline" (click)="confirm.answer(false)">Cancel</button>
            <button class="btn btn-danger" (click)="confirm.answer(true)">{{ s.confirmText }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  confirm = inject(ConfirmService);
}
