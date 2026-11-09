import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ORDER_STATUSES, Order, OrderItem, OrderStatus } from '../../models/models';
import { ConfirmService } from '../../services/confirm.service';
import { CustomerService } from '../../services/customer.service';
import { MenuService } from '../../services/menu.service';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order.service';
import { SettingsService } from '../../services/settings.service';
import { TableService } from '../../services/table.service';
import { InrPipe } from '../../shared/inr.pipe';
import { round2 } from '../../shared/utils';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, InrPipe, RouterLink],
  template: `
    <div class="page-header">
      <div><h1>Orders</h1><p>Create orders and move them through the kitchen.</p></div>
      <button class="btn btn-primary" (click)="openNew()"><i class="fa-solid fa-plus"></i> New order</button>
    </div>

    <div class="toolbar">
      <div class="search"><i class="fa-solid fa-magnifying-glass"></i>
        <input placeholder="Search by order number or customer" (input)="search.set($any($event.target).value)" aria-label="Search orders" />
      </div>
      <select style="width:190px" (change)="statusFilter.set($any($event.target).value)" aria-label="Filter by status">
        <option value="All">All statuses</option>
        @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
      </select>
    </div>

    <div class="card table-wrap">
      <table class="data">
        <thead><tr><th>Order</th><th>Customer</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Placed</th><th></th></tr></thead>
        <tbody>
          @for (o of filtered(); track o.id) {
            <tr>
              <td><b>#{{ o.orderNo }}</b></td>
              <td>{{ o.customerName }}</td>
              <td>{{ o.tableName }}</td>
              <td class="muted" style="max-width:220px">{{ itemsText(o) }}</td>
              <td><b>{{ o.total | inr }}</b></td>
              <td>
                <select class="status" [class]="'status badge-' + o.status.toLowerCase()" (change)="changeStatus(o, $any($event.target).value)" [attr.aria-label]="'Status of order ' + o.orderNo">
                  @for (s of statuses; track s) { <option [value]="s" [selected]="s === o.status">{{ s }}</option> }
                </select>
              </td>
              <td class="muted">{{ o.createdAt | date: 'dd MMM, h:mm a' }}</td>
              <td class="row">
                <a class="icon-btn" style="display:grid;place-items:center" [routerLink]="['/billing']" [queryParams]="{ order: o.id }" title="View bill"><i class="fa-solid fa-file-invoice"></i></a>
                <button class="icon-btn danger" (click)="remove(o)" title="Delete order"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8"><div class="empty"><i class="fa-solid fa-receipt"></i>No orders found.</div></td></tr>
          }
        </tbody>
      </table>
    </div>

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)">
        <form class="modal" style="max-width:680px" [formGroup]="form" (ngSubmit)="submit()" (click)="$event.stopPropagation()">
          <h3>New order</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="cu">Customer</label>
              <select id="cu" formControlName="customerId">
                <option value="">Walk-in customer</option>
                @for (c of customers.items(); track c.id) { <option [value]="c.id">{{ c.name }} ({{ c.phone }})</option> }
              </select>
            </div>
            <div class="form-group">
              <label for="ta">Table</label>
              <select id="ta" formControlName="tableId">
                <option value="">Takeaway (no table)</option>
                @for (t of availableTables(); track t.id) { <option [value]="t.id">{{ t.name }} ({{ t.seats }} seats)</option> }
              </select>
            </div>
          </div>

          <label style="font-weight:600;font-size:12px;color:var(--maroon-700)">Food items</label>
          <div formArrayName="items">
            @for (line of form.controls.items.controls; track line; let i = $index) {
              <div class="line" [formGroupName]="i">
                <select formControlName="menuItemId" [attr.aria-label]="'Food item ' + (i + 1)">
                  <option value="">Choose a dish</option>
                  @for (m of availableMenu(); track m.id) { <option [value]="m.id">{{ m.name }} - {{ m.price | inr }}</option> }
                </select>
                <input type="number" min="1" formControlName="qty" aria-label="Quantity" />
                <button type="button" class="icon-btn danger" (click)="removeLine(i)" [disabled]="form.controls.items.length === 1" title="Remove"><i class="fa-solid fa-xmark"></i></button>
              </div>
            }
          </div>
          <button type="button" class="btn btn-outline btn-sm" (click)="addLine()"><i class="fa-solid fa-plus"></i> Add another item</button>

          <div class="totals">
            <div class="spread"><span>Subtotal</span><b>{{ subtotal() | inr }}</b></div>
            <div class="spread"><span>GST ({{ settings.settings().gstPercent }}%)</span><b>{{ gst() | inr }}</b></div>
            <div class="spread big"><span>Total</span><b>{{ subtotal() + gst() | inr }}</b></div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="showForm.set(false)">Cancel</button>
            <button type="submit" class="btn btn-primary">Place order</button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    .line { display: grid; grid-template-columns: 1fr 80px 36px; gap: 8px; margin: 8px 0; }
    .totals { background: var(--cream); border-radius: 12px; padding: 14px; margin: 16px 0; display: flex; flex-direction: column; gap: 8px; }
    .big { font-size: 17px; color: var(--maroon-700); border-top: 1px dashed var(--line); padding-top: 8px; }
    select.status { width: 120px; padding: 6px 8px; font-weight: 700; font-size: 12px; border-radius: 20px; }
  `],
})
export class OrdersComponent {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);
  private confirm = inject(ConfirmService);
  private orders = inject(OrderService);
  private menu = inject(MenuService);
  private tables = inject(TableService);
  customers = inject(CustomerService);
  settings = inject(SettingsService);

  statuses = ORDER_STATUSES;
  search = signal('');
  statusFilter = signal('All');
  showForm = signal(false);

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const s = this.statusFilter();
    return this.orders.items()
      .filter((o) => (s === 'All' || o.status === s) && (!q || String(o.orderNo).includes(q) || o.customerName.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  availableTables = computed(() => this.tables.items().filter((t) => t.status === 'Available'));
  availableMenu = computed(() => this.menu.items().filter((m) => m.available));

  form = this.fb.nonNullable.group({
    customerId: [''],
    tableId: [''],
    items: this.fb.nonNullable.array([this.newLine()]),
  });

  private newLine() {
    return this.fb.nonNullable.group({
      menuItemId: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
    });
  }

  itemsText(o: Order) { return o.items.map((i) => `${i.qty}× ${i.name}`).join(', '); }

  addLine() { this.form.controls.items.push(this.newLine()); }
  removeLine(i: number) { this.form.controls.items.removeAt(i); }

  subtotal(): number {
    return round2(this.form.controls.items.controls.reduce((sum, g) => {
      const m = this.menu.getById(g.controls.menuItemId.value);
      return sum + (m ? m.price * (g.controls.qty.value || 0) : 0);
    }, 0));
  }
  gst(): number { return round2((this.subtotal() * this.settings.settings().gstPercent) / 100); }

  openNew() {
    this.form.controls.items.clear();
    this.form.controls.items.push(this.newLine());
    this.form.patchValue({ customerId: '', tableId: '' });
    this.showForm.set(true);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notify.error('Choose a dish and a quantity for every line.');
      return;
    }
    const v = this.form.getRawValue();
    const items: OrderItem[] = [];
    for (const l of v.items) {
      const m = this.menu.getById(l.menuItemId);
      if (!m) continue;
      const existing = items.find((x) => x.menuItemId === m.id);
      if (existing) existing.qty += l.qty;
      else items.push({ menuItemId: m.id, name: m.name, price: m.price, qty: l.qty });
    }
    const order = this.orders.create({ customerId: v.customerId || null, tableId: v.tableId || null, items });
    this.notify.success(`Order #${order.orderNo} placed.`);
    this.showForm.set(false);
  }

  changeStatus(o: Order, status: OrderStatus) {
    this.orders.setStatus(o, status);
    this.notify.success(`Order #${o.orderNo} is now ${status}.`);
  }

  async remove(o: Order) {
    if (!(await this.confirm.ask(`Delete order #${o.orderNo}? This cannot be undone.`))) return;
    if (o.tableId && (o.status === 'Pending' || o.status === 'Preparing')) this.tables.setStatus(o.tableId, 'Available');
    this.orders.remove(o.id);
    this.notify.success('Order deleted.');
  }
}
