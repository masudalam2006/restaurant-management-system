import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { OrderService } from '../../services/order.service';
import { SettingsService } from '../../services/settings.service';
import { InrPipe } from '../../shared/inr.pipe';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [DatePipe, InrPipe],
  template: `
    <div class="page-header no-print">
      <div><h1>Billing</h1><p>Pick an order to see its bill, then print it or mark it paid.</p></div>
    </div>

    <div class="layout">
      <aside class="card list no-print">
        <div class="search" style="margin-bottom:12px"><i class="fa-solid fa-magnifying-glass"></i>
          <input placeholder="Search order or customer" (input)="search.set($any($event.target).value)" aria-label="Search bills" /></div>
        @for (o of filtered(); track o.id) {
          <button class="item" [class.on]="o.id === selectedId()" (click)="selectedId.set(o.id)">
            <div class="spread"><b>#{{ o.orderNo }}</b><b>{{ o.total | inr }}</b></div>
            <div class="spread"><span class="muted">{{ o.customerName }}</span>
              <span [class]="'badge ' + (o.paid ? 'badge-paid' : 'badge-unpaid')">{{ o.paid ? 'Paid' : 'Unpaid' }}</span></div>
          </button>
        } @empty { <div class="empty">No orders to bill.</div> }
      </aside>

      <section>
        @if (order(); as o) {
          <div class="card invoice">
            <div class="head">
              <div>
                <h2>{{ settings.settings().name }}</h2>
                <p class="muted">{{ settings.settings().address }}<br />{{ settings.settings().phone }} | {{ settings.settings().email }}</p>
              </div>
              <div class="right"><h3>Invoice #{{ o.orderNo }}</h3>
                <p class="muted">{{ o.createdAt | date: 'dd MMM yyyy, h:mm a' }}</p>
                <span [class]="'badge ' + (o.paid ? 'badge-paid' : 'badge-unpaid')">{{ o.paid ? 'Paid' : 'Unpaid' }}</span></div>
            </div>
            <p><b>Customer:</b> {{ o.customerName }} &nbsp; <b>Table:</b> {{ o.tableName }}</p>
            <div class="table-wrap">
              <table class="data" style="min-width:380px">
                <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Amount</th></tr></thead>
                <tbody>
                  @for (i of o.items; track i.menuItemId) {
                    <tr><td>{{ i.name }}</td><td class="right">{{ i.qty }}</td><td class="right">{{ i.price | inr }}</td><td class="right">{{ i.price * i.qty | inr }}</td></tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="sum">
              <div class="spread"><span>Subtotal</span><span>{{ o.subtotal | inr }}</span></div>
              <div class="spread"><span>GST ({{ o.gstPercent }}%)</span><span>{{ o.gst | inr }}</span></div>
              <div class="spread final"><span>Final amount</span><span>{{ o.total | inr }}</span></div>
            </div>
            <p class="muted" style="text-align:center;margin-top:20px">Thank you for dining with us.</p>
          </div>
          <div class="row no-print" style="margin-top:14px">
            <button class="btn btn-primary" (click)="print()"><i class="fa-solid fa-print"></i> Print invoice</button>
            @if (!o.paid) { <button class="btn btn-dark" (click)="markPaid(o.id)"><i class="fa-solid fa-circle-check"></i> Mark as paid</button> }
          </div>
        } @else {
          <div class="card empty"><i class="fa-solid fa-file-invoice"></i>Select an order to generate its bill.</div>
        }
      </section>
    </div>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 330px 1fr; gap: 16px; align-items: start; }
    .list { max-height: 78vh; overflow: auto; padding: 14px; }
    .item { display: block; width: 100%; text-align: left; border: 2px solid var(--line); background: var(--surface-2); border-radius: 12px; padding: 10px 12px; margin-bottom: 8px; cursor: pointer; font: 500 13px 'Montserrat'; color: var(--text); }
    .item.on { border-color: var(--gold); background: var(--cream); }
    .head { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; border-bottom: 2px dashed var(--line); margin-bottom: 14px; padding-bottom: 10px; }
    .head p { margin: 4px 0; line-height: 1.5; }
    .sum { margin-left: auto; max-width: 300px; display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
    .final { font-weight: 700; font-size: 18px; color: var(--maroon-700); border-top: 2px solid var(--maroon-700); padding-top: 8px; }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } .list { max-height: 260px; } }
  `],
})
export class BillingComponent {
  private orders = inject(OrderService);
  private notify = inject(NotificationService);
  private route = inject(ActivatedRoute);
  settings = inject(SettingsService);

  search = signal('');
  selectedId = signal<string | null>(this.route.snapshot.queryParamMap.get('order'));

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.orders.items()
      .filter((o) => o.status !== 'Cancelled' && (!q || String(o.orderNo).includes(q) || o.customerName.toLowerCase().includes(q)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });
  order = computed(() => this.orders.getById(this.selectedId()) ?? null);

  markPaid(id: string) {
    this.orders.update(id, { paid: true });
    this.notify.success('Payment recorded.');
  }
  print() { window.print(); }
}
