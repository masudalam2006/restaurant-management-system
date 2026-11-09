import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { InrPipe } from '../../shared/inr.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, InrPipe, RouterLink],
  template: `
    <div class="page-header">
      <div><h1>Dashboard</h1><p>Your restaurant at a glance.</p></div>
      <a routerLink="/orders" class="btn btn-primary"><i class="fa-solid fa-plus"></i> New order</a>
    </div>

    <div class="stats">
      <div class="stat"><i class="fa-solid fa-receipt"></i><div><span>Total orders</span><h3>{{ totalOrders() }}</h3></div></div>
      <div class="stat"><i class="fa-solid fa-indian-rupee-sign"></i><div><span>Revenue</span><h3>{{ revenue() | inr }}</h3></div></div>
      <div class="stat"><i class="fa-solid fa-clock"></i><div><span>Orders in progress</span><h3>{{ inProgress() }}</h3></div></div>
    </div>

    <section class="card">
      <div class="section-heading">
        <div><h3>Recent orders</h3><p>Check the latest activity and order status.</p></div>
        <a routerLink="/orders" class="text-link">View all orders <i class="fa-solid fa-arrow-right"></i></a>
      </div>
      @if (recent().length) {
        <div class="table-wrap">
          <table class="data">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Time</th></tr></thead>
            <tbody>
              @for (o of recent(); track o.id) {
                <tr>
                  <td><b>#{{ o.orderNo }}</b></td>
                  <td>{{ o.customerName }}</td>
                  <td>{{ o.total | inr }}</td>
                  <td><span [class]="'badge badge-' + o.status.toLowerCase()">{{ o.status }}</span></td>
                  <td class="muted">{{ o.createdAt | date: 'dd MMM, h:mm a' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <div class="empty"><i class="fa-solid fa-receipt"></i><p>No orders yet.</p><a routerLink="/orders" class="btn btn-primary">Create your first order</a></div>
      }
    </section>
  `,
  styles: [`
    .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px; margin-bottom:16px; }
    .stat { display:flex; gap:14px; align-items:center; padding:18px; border-radius:var(--radius); background:var(--surface); border:1px solid var(--line); box-shadow:var(--shadow); }
    .stat > i { font-size:19px; width:44px; height:44px; border-radius:13px; display:grid; place-items:center; background:rgba(75,141,255,.15); color:#78aaff; }
    .stat:nth-child(2) > i { background:rgba(53,214,163,.14); color:#55dcb0; }
    .stat:nth-child(3) > i { background:rgba(244,189,98,.14); color:#f4bd62; }
    .stat span { color:var(--muted); font-size:12px; }
    .stat h3 { font-size:23px; margin-top:3px; }
    .section-heading { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:14px; }
    .section-heading p { margin:4px 0 0; font-size:12px; }
    .text-link { color:#78aaff; font-size:12px; font-weight:650; white-space:nowrap; }
    @media(max-width:560px){ .section-heading{align-items:flex-start;flex-direction:column;} .stats{grid-template-columns:1fr;} }
  `],
})
export class DashboardComponent {
  private orders = inject(OrderService);
  totalOrders = computed(() => this.orders.items().length);
  revenue = computed(() => this.orders.items().filter(o => o.status === 'Completed').reduce((sum,o) => sum + o.total, 0));
  inProgress = computed(() => this.orders.items().filter(o => o.status === 'Pending' || o.status === 'Preparing').length);
  recent = computed(() => [...this.orders.items()].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,5));
}
