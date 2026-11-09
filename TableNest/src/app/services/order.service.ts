import { Injectable, inject } from '@angular/core';
import { Order, OrderItem, OrderStatus } from '../models/models';
import { round2 } from '../shared/utils';
import { CustomerService } from './customer.service';
import { LocalStore } from './local-store';
import { MenuService } from './menu.service';
import { SettingsService } from './settings.service';
import { TableService } from './table.service';

@Injectable({ providedIn: 'root' })
export class OrderService extends LocalStore<Order> {
  protected override readonly key = 'rms_orders';
  private menu = inject(MenuService);
  private customers = inject(CustomerService);
  private tables = inject(TableService);
  private settings = inject(SettingsService);

  constructor() { super(); this.load(); }

  /** Creates an order, calculates totals and marks the table as occupied. */
  create(input: { customerId: string | null; tableId: string | null; items: OrderItem[] }): Order {
    const gstPercent = this.settings.settings().gstPercent;
    const subtotal = round2(input.items.reduce((s, i) => s + i.price * i.qty, 0));
    const gst = round2((subtotal * gstPercent) / 100);
    const customer = this.customers.getById(input.customerId);
    const table = this.tables.getById(input.tableId);
    const orderNo = this.items().reduce((m, o) => Math.max(m, o.orderNo), 1000) + 1;

    const order = this.add({
      orderNo,
      customerId: customer?.id ?? null,
      customerName: customer?.name ?? 'Walk-in Customer',
      tableId: table?.id ?? null,
      tableName: table?.name ?? 'Takeaway',
      items: input.items,
      subtotal, gstPercent, gst,
      total: round2(subtotal + gst),
      status: 'Pending',
      paid: false,
      createdAt: new Date().toISOString(),
    });
    if (table) this.tables.setStatus(table.id, 'Occupied');
    return order;
  }

  setStatus(order: Order, status: OrderStatus) {
    this.update(order.id, { status });
    if (order.tableId) {
      const done = status === 'Completed' || status === 'Cancelled';
      this.tables.setStatus(order.tableId, done ? 'Available' : 'Occupied');
    }
  }

  protected override seed(): Order[] {
    const menu = this.menu.items();
    const customers = this.customers.items();
    const out: Order[] = [];
    let seedNo = 7;
    const rnd = () => { seedNo = (seedNo * 9301 + 49297) % 233280; return seedNo / 233280; };
    let no = 1000;

    for (let d = 13; d >= 0; d--) {
      const count = 3 + Math.floor(rnd() * 5);
      for (let i = 0; i < count; i++) {
        const items: OrderItem[] = [];
        const lines = 1 + Math.floor(rnd() * 3);
        for (let k = 0; k < lines; k++) {
          const m = menu[Math.floor(rnd() * menu.length)];
          if (!items.some((x) => x.menuItemId === m.id)) {
            items.push({ menuItemId: m.id, name: m.name, price: m.price, qty: 1 + Math.floor(rnd() * 3) });
          }
        }
        const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
        const gst = round2(subtotal * 0.05);
        const date = new Date();
        date.setDate(date.getDate() - d);
        date.setHours(11 + Math.floor(rnd() * 10), Math.floor(rnd() * 60), 0, 0);
        const cust = rnd() > 0.4 ? customers[Math.floor(rnd() * customers.length)] : undefined;
        const status: OrderStatus = d === 0
          ? (['Pending', 'Preparing', 'Completed'] as OrderStatus[])[i % 3]
          : rnd() > 0.92 ? 'Cancelled' : 'Completed';
        out.push({
          id: 'o' + ++no, orderNo: no,
          customerId: cust?.id ?? null, customerName: cust?.name ?? 'Walk-in Customer',
          tableId: null, tableName: 'Takeaway',
          items, subtotal, gstPercent: 5, gst, total: round2(subtotal + gst),
          status, paid: status === 'Completed' && d > 0, createdAt: date.toISOString(),
        });
      }
    }
    return out;
  }
}
