import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmService } from '../../services/confirm.service';
import { NotificationService } from '../../services/notification.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header"><div><h1>Settings</h1><p>Restaurant details shown on invoices and in the sidebar.</p></div></div>

    <form class="card" style="max-width:720px" [formGroup]="form" (ngSubmit)="save()">
      <div class="form-group"><label for="rn">Restaurant name</label><input id="rn" formControlName="name" />
        @if (form.controls.name.touched && form.controls.name.invalid) { <span class="error">Enter the restaurant name</span> }</div>
      <div class="form-group"><label for="ra">Address</label><textarea id="ra" rows="2" formControlName="address"></textarea>
        @if (form.controls.address.touched && form.controls.address.invalid) { <span class="error">Enter the address</span> }</div>
      <div class="form-grid">
        <div class="form-group"><label for="rp">Phone</label><input id="rp" formControlName="phone" />
          @if (form.controls.phone.touched && form.controls.phone.invalid) { <span class="error">Enter a contact number</span> }</div>
        <div class="form-group"><label for="re">Email</label><input id="re" type="email" formControlName="email" />
          @if (form.controls.email.touched && form.controls.email.invalid) { <span class="error">Enter a valid email address</span> }</div>
      </div>
      <div class="form-group" style="max-width:240px"><label for="rg">GST (%)</label><input id="rg" type="number" formControlName="gstPercent" />
        @if (form.controls.gstPercent.touched && form.controls.gstPercent.invalid) { <span class="error">GST must be between 0 and 28</span> }</div>
      <div class="row"><button class="btn btn-primary" type="submit">Save settings</button></div>
    </form>

    <div class="card" style="max-width:720px;margin-top:16px">
      <h3>Demo data</h3>
      <p class="muted">Reset menu, orders, tables, customers, staff and settings back to the sample data. You will be signed out.</p>
      <button class="btn btn-danger" (click)="reset()"><i class="fa-solid fa-rotate-left"></i> Reset demo data</button>
    </div>
  `,
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);
  private confirm = inject(ConfirmService);
  private settings = inject(SettingsService);

  form = this.fb.nonNullable.group({
    name: [this.settings.settings().name, Validators.required],
    address: [this.settings.settings().address, Validators.required],
    phone: [this.settings.settings().phone, Validators.required],
    email: [this.settings.settings().email, [Validators.required, Validators.email]],
    gstPercent: [this.settings.settings().gstPercent, [Validators.required, Validators.min(0), Validators.max(28)]],
  });

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.notify.error('Please fix the highlighted fields.'); return; }
    this.settings.save(this.form.getRawValue());
    this.notify.success('Settings saved. New orders will use the updated GST.');
  }

  async reset() {
    if (await this.confirm.ask('This replaces all your data with the sample data. Continue?', 'Reset demo data', 'Reset')) {
      Object.keys(localStorage).filter((k) => k.startsWith('rms_')).forEach((k) => localStorage.removeItem(k));
      location.href = '/login';
    }
  }
}
