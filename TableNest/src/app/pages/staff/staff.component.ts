import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ROLES, Role, Staff } from '../../models/models';
import { ConfirmService } from '../../services/confirm.service';
import { NotificationService } from '../../services/notification.service';
import { StaffService } from '../../services/staff.service';
import { InrPipe } from '../../shared/inr.pipe';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, InrPipe],
  template: `
    <div class="page-header">
      <div><h1>Staff</h1><p>{{ staff.items().length }} team members.</p></div>
      <button class="btn btn-primary" (click)="openAdd()"><i class="fa-solid fa-user-plus"></i> Add staff member</button>
    </div>

    <div class="toolbar">
      <div class="search"><i class="fa-solid fa-magnifying-glass"></i>
        <input placeholder="Search staff by name or role" (input)="search.set($any($event.target).value)" aria-label="Search staff" /></div>
    </div>

    <div class="card table-wrap">
      <table class="data">
        <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Email</th><th>Salary</th><th>Joined</th><th></th></tr></thead>
        <tbody>
          @for (s of filtered(); track s.id) {
            <tr>
              <td><b>{{ s.name }}</b></td>
              <td><span class="badge badge-preparing">{{ s.role }}</span></td>
              <td>{{ s.phone }}</td><td class="muted">{{ s.email }}</td>
              <td>{{ s.salary | inr }}</td><td class="muted">{{ s.joinDate | date: 'dd MMM yyyy' }}</td>
              <td class="row">
                <button class="icon-btn" (click)="openEdit(s)" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="icon-btn danger" (click)="remove(s)" title="Delete"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          } @empty { <tr><td colspan="7"><div class="empty"><i class="fa-solid fa-user-tie"></i>No staff members found.</div></td></tr> }
        </tbody>
      </table>
    </div>

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)">
        <form class="modal" [formGroup]="form" (ngSubmit)="save()" (click)="$event.stopPropagation()">
          <h3>{{ editingId ? 'Edit staff member' : 'Add staff member' }}</h3>
          <div class="form-group"><label for="sn">Full name</label><input id="sn" formControlName="name" />
            @if (form.controls.name.touched && form.controls.name.invalid) { <span class="error">Enter the staff member's name</span> }</div>
          <div class="form-grid">
            <div class="form-group"><label for="sr">Role</label>
              <select id="sr" formControlName="role">@for (r of roles; track r) { <option [value]="r">{{ r }}</option> }</select></div>
            <div class="form-group"><label for="sj">Joining date</label><input id="sj" type="date" formControlName="joinDate" />
              @if (form.controls.joinDate.touched && form.controls.joinDate.invalid) { <span class="error">Choose a joining date</span> }</div>
            <div class="form-group"><label for="sp">Phone</label><input id="sp" formControlName="phone" maxlength="10" />
              @if (form.controls.phone.touched && form.controls.phone.invalid) { <span class="error">Enter a 10 digit phone number</span> }</div>
            <div class="form-group"><label for="ss">Monthly salary (₹)</label><input id="ss" type="number" formControlName="salary" />
              @if (form.controls.salary.touched && form.controls.salary.invalid) { <span class="error">Enter a salary of 0 or more</span> }</div>
          </div>
          <div class="form-group"><label for="se">Email</label><input id="se" type="email" formControlName="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) { <span class="error">Enter a valid email address</span> }</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="showForm.set(false)">Cancel</button>
            <button class="btn btn-primary" type="submit">Save staff member</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class StaffComponent {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);
  private confirm = inject(ConfirmService);
  staff = inject(StaffService);

  roles = ROLES;
  search = signal('');
  showForm = signal(false);
  editingId: string | null = null;

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.staff.items().filter((s) => !q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q));
  });

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    role: ['Waiter' as Role, Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    salary: [0, [Validators.required, Validators.min(0)]],
    joinDate: ['', Validators.required],
  });

  openAdd() {
    this.editingId = null;
    this.form.reset({ name: '', role: 'Waiter', phone: '', email: '', salary: 0, joinDate: new Date().toISOString().slice(0, 10) });
    this.showForm.set(true);
  }
  openEdit(s: Staff) {
    this.editingId = s.id;
    this.form.reset({ name: s.name, role: s.role, phone: s.phone, email: s.email, salary: s.salary, joinDate: s.joinDate });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.notify.error('Please fix the highlighted fields.'); return; }
    const v = this.form.getRawValue();
    if (this.editingId) { this.staff.update(this.editingId, v); this.notify.success('Staff member updated.'); }
    else { this.staff.add(v); this.notify.success('Staff member added.'); }
    this.showForm.set(false);
  }

  async remove(s: Staff) {
    if (await this.confirm.ask(`Remove ${s.name} from the staff list?`)) {
      this.staff.remove(s.id);
      this.notify.success('Staff member removed.');
    }
  }
}
