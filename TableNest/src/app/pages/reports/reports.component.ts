import { Component, computed, inject, signal } from '@angular/core';
import { BarChartComponent } from '../../components/bar-chart/bar-chart.component';
import { OrderService } from '../../services/order.service';
import { InrPipe } from '../../shared/inr.pipe';
import { dateKey, monthKey } from '../../shared/utils';

type Period = 'daily' | 'weekly' | 'monthly';
interface Row { label: string; orders: number; revenue: number; }

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [BarChartComponent, InrPipe],
  template: `
    <div class="page-header">
      <div><h1>Reports</h1><p>Revenue counts completed orders. Cancelled orders are left out.</p></div>
      <div class="tabs">
        @for (p of periods; track p.key) {
          <button [class.on]="period() === p.key" (click)="period.set(p.key)">{{ p.label }}</button>
        }
      </div>
    </div>

    <div class="two-col">
      <div class="card">
        <h3>{{ title() }}</h3>
        <app-bar-chart [labels]="labels()" [values]="values()" />
      </div>
      <div class="card">
        <h3>Summary</h3>
        <div class="sumrow"><span>Total revenue</span><b>{{ total() | inr }}</b></div>
        <div class="sumrow"><span>Total orders</span><b>{{ orderTotal() }}</b></div>
        <div class="sumrow"><span>Average per period</span><b>{{ average() | inr }}</b></div>
      </div>
    </div>

    <div class="two-col">
      <div class="card table-wrap">
        <h3>{{ title() }} in detail</h3>
        <table class="data" style="min-width:340px">
          <thead><tr><th>Period</th><th class="right">Orders</th><th class="right">Revenue</th></tr></thead>
          <tbody>
            @for (r of rows(); track r.label) {
              <tr><td>{{ r.label }}</td><td class="right">{{ r.orders }}</td><td class="right"><b>{{ r.revenue | inr }}</b></td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="card">
        <h3>Best-selling food items</h3>
        @for (b of best(); track b.name; let i = $index) {
          <div class="sumrow"><span>{{ i + 1 }}. {{ b.name }}</span><b>{{ b.qty }} sold</b></div>
        } @empty { <div class="empty">No sales yet.</div> }
      </div>
    </div>
  `,
  styles: [`
    .tabs { display: flex; background: var(--surface-2); border-radius: 12px; padding: 4px; border: 1px solid var(--line); }
    .tabs button { border: 0; background: transparent; padding: 8px 16px; border-radius: 9px; font: 700 13px 'Montserrat'; color: var(--muted); cursor: pointer; }
    .tabs button.on { background: var(--gold); color: var(--maroon-900); }
    .sumrow { display: flex; justify-content: space-between; gap: 10px; padding: 11px 0; border-bottom: 1px solid var(--line); }
  `],
})
export class ReportsComponent {
  private orders = inject(OrderService);
  period = signal<Period>('daily');
  periods: { key: Period; label: string }[] = [
    { key: 'daily', label: 'Daily' }, { key: 'weekly', label: 'Weekly' }, { key: 'monthly', label: 'Monthly' },
  ];

  private valid = computed(() => this.orders.items().filter((o) => o.status !== 'Cancelled'));

  private summarize(label: string, match: (key: string) => boolean): Row {
    const list = this.valid().filter((o) => match(dateKey(o.createdAt)));
    return {
      label,
      orders: list.length,
      revenue: list.filter((o) => o.status === 'Completed').reduce((s, o) => s + o.total, 0),
    };
  }

  rows = computed<Row[]>(() => {
    const out: Row[] = [];
    const today = new Date();
    const short = (d: Date) => d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const p = this.period();

    if (p === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const k = dateKey(d);
        out.push(this.summarize(short(d), (x) => x === k));
      }
    } else if (p === 'weekly') {
      for (let w = 3; w >= 0; w--) {
        const end = new Date(today); end.setDate(end.getDate() - w * 7);
        const start = new Date(end); start.setDate(start.getDate() - 6);
        const a = dateKey(start), b = dateKey(end);
        out.push(this.summarize(`${short(start)} - ${short(end)}`, (x) => x >= a && x <= b));
      }
    } else {
      for (let m = 5; m >= 0; m--) {
        const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const k = monthKey(d);
        out.push(this.summarize(d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), (x) => x.startsWith(k)));
      }
    }
    return out;
  });

  labels = computed(() => this.rows().map((r) => r.label));
  values = computed(() => this.rows().map((r) => r.revenue));
  total = computed(() => this.values().reduce((s, v) => s + v, 0));
  orderTotal = computed(() => this.rows().reduce((s, r) => s + r.orders, 0));
  average = computed(() => (this.rows().length ? this.total() / this.rows().length : 0));
  title = computed(() => ({ daily: 'Daily sales (last 7 days)', weekly: 'Weekly sales (last 4 weeks)', monthly: 'Monthly revenue (last 6 months)' })[this.period()]);

  best = computed(() => {
    const map = new Map<string, number>();
    this.valid().forEach((o) => o.items.forEach((i) => map.set(i.name, (map.get(i.name) ?? 0) + i.qty)));
    return [...map.entries()].map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty).slice(0, 8);
  });
}
