import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Customer } from '../../models/models';
import { ConfirmService } from '../../services/confirm.service';
import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order.service';
import { InrPipe } from '../../shared/inr.pipe';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, InrPipe],
  template: `
    <div class="page-header">
      <div><h1>Customers</h1><p>{{ customers.items().length }} guests on record.</p></div>
      <button class="btn btn-primary" (click)="openAdd()"><i class="fa-solid fa-user-plus"></i> Add customer</button>
    </div>

    <div class="toolbar">
      <div class="search"><i class="fa-solid fa-magnifying-glass"></i>
        <input placeholder="Search by name, phone or email" (input)="search.set($any($event.target).value)" aria-label="Search customers" /></div>
    </div>

    <div class="card table-wrap">
      <table class="data">
        <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th></th></tr></thead>
        <tbody>
          @for (c of filtered(); track c.id) {
            <tr>
              <td><b>{{ c.name }}</b></td><td>{{ c.phone }}</td><td class="muted">{{ c.email || '-' }}</td>
              <td>{{ orderCount(c) }}</td>
              <td class="row">
                <button class="btn btn-outline btn-sm" (click)="history.set(c)"><i class="fa-solid fa-clock-rotate-left"></i> History</button>
                <button class="icon-btn" (click)="openEdit(c)" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="icon-btn danger" (click)="remove(c)" title="Delete"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          } @empty { <tr><td colspan="5"><div class="empty"><i class="fa-solid fa-users"></i>No customers found.</div></td></tr> }
        </tbody>
      </table>
    </div>

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)">
        <form class="modal" style="max-width:440px" [formGroup]="form" (ngSubmit)="save()" (click)="$event.stopPropagation()">
          <h3>{{ editingId ? 'Edit customer' : 'Add customer' }}</h3>
          <div class="form-group"><label for="cn">Name</label><input id="cn" formControlName="name" />
            @if (form.controls.name.touched && form.controls.name.invalid) { <span class="error">Enter the customer name</span> }</div>
          <div class="form-group"><label for="cp">Phone number</label><input id="cp" formControlName="phone" inputmode="numeric" maxlength="10" />
            @if (form.controls.phone.touched && form.controls.phone.invalid) { <span class="error">Enter a 10 digit phone number</span> }</div>
          <div class="form-group"><label for="ce">Email (optional)</label><input id="ce" type="email" formControlName="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) { <span class="error">Enter a valid email address</span> }</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="showForm.set(false)">Cancel</button>
            <button class="btn btn-primary" type="submit">Save customer</button>
          </div>
        </form>
      </div>
    }

    @if (history(); as c) {
      <div class="modal-backdrop" (click)="history.set(null)">
        <div class="modal" style="max-width:640px" (click)="$event.stopPropagation()">
          <div class="spread"><h3>{{ c.name }}'s orders</h3><button class="icon-btn" (click)="history.set(null)" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div>
          <p class="muted">{{ historyOrders().length }} orders, {{ spent() | inr }} spent on completed orders.</p>
          <div class="table-wrap">
            <table class="data" style="min-width:420px">
              <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                @for (o of historyOrders(); track o.id) {
                  <tr><td>#{{ o.orderNo }}</td><td>{{ o.createdAt | date: 'dd MMM yyyy' }}</td><td>{{ o.total | inr }}</td>
                    <td><span [class]="'badge badge-' + o.status.toLowerCase()">{{ o.status }}</span></td></tr>
                } @empty { <tr><td colspan="4"><div class="empty">No orders yet.</div></td></tr> }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    }
  `,
})
export class CustomersComponent {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);
  private confirm = inject(ConfirmService);
  private orders = inject(OrderService);
  customers = inject(CustomerService);

  search = signal('');
  showForm = signal(false);
  history = signal<Customer | null>(null);
  editingId: string | null = null;

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.customers.items().filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q));
  });
  historyOrders = computed(() => {
    const c = this.history();
    return c ? this.orders.items().filter((o) => o.customerId === c.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  });
  spent = computed(() => this.historyOrders().filter((o) => o.status === 'Completed').reduce((s, o) => s + o.total, 0));
  orderCount(c: Customer) { return this.orders.items().filter((o) => o.customerId === c.id).length; }

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    email: ['', Validators.email],
  });

  openAdd() { this.editingId = null; this.form.reset({ name: '', phone: '', email: '' }); this.showForm.set(true); }
  openEdit(c: Customer) { this.editingId = c.id; this.form.reset({ name: c.name, phone: c.phone, email: c.email }); this.showForm.set(true); }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.notify.error('Please fix the highlighted fields.'); return; }
    const v = this.form.getRawValue();
    if (this.editingId) {
      this.customers.update(this.editingId, v);
      this.notify.success('Customer updated.');
    } else {
      this.customers.add({ ...v, createdAt: new Date().toISOString() });
      this.notify.success('Customer added.');
    }
    this.showForm.set(false);
  }

  async remove(c: Customer) {
    if (await this.confirm.ask(`Delete customer "${c.name}"? Their past orders will stay in the system.`)) {
      this.customers.remove(c.id);
      this.notify.success('Customer deleted.');
    }
  }
}
