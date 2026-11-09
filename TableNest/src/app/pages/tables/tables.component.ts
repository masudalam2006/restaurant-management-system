import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RestaurantTable } from '../../models/models';
import { ConfirmService } from '../../services/confirm.service';
import { NotificationService } from '../../services/notification.service';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="page-header">
      <div><h1>Tables</h1>
        <p>{{ count('Available') }} available, {{ count('Occupied') }} occupied, {{ count('Reserved') }} reserved.</p></div>
      <button class="btn btn-primary" (click)="openAdd()"><i class="fa-solid fa-plus"></i> Add table</button>
    </div>

    <div class="grid cards">
      @for (t of tables.items(); track t.id) {
        <article class="card tbl" [class]="'card tbl s-' + t.status.toLowerCase()">
          <div class="spread">
            <h3>{{ t.name }}</h3>
            <button class="icon-btn danger" (click)="remove(t)" title="Delete table"><i class="fa-solid fa-trash"></i></button>
          </div>
          <p class="muted"><i class="fa-solid fa-chair"></i> {{ t.seats }} seats</p>
          <span [class]="'badge badge-' + t.status.toLowerCase()">{{ t.status }}</span>
          @if (t.status === 'Reserved') {
            <p class="res">{{ t.reservedFor }}<br /><span class="muted">{{ t.reservedTime | date: 'dd MMM, h:mm a' }}</span></p>
          }
          <div class="row" style="margin-top:14px;flex-wrap:wrap">
            @switch (t.status) {
              @case ('Available') {
                <button class="btn btn-dark btn-sm" (click)="setStatus(t, 'Occupied')">Seat guests</button>
                <button class="btn btn-outline btn-sm" (click)="openReserve(t)">Reserve</button>
              }
              @case ('Occupied') { <button class="btn btn-primary btn-sm" (click)="setStatus(t, 'Available')">Free table</button> }
              @case ('Reserved') {
                <button class="btn btn-dark btn-sm" (click)="setStatus(t, 'Occupied')">Guests arrived</button>
                <button class="btn btn-outline btn-sm" (click)="setStatus(t, 'Available')">Cancel</button>
              }
            }
          </div>
        </article>
      }
    </div>

    @if (showAdd()) {
      <div class="modal-backdrop" (click)="showAdd.set(false)">
        <form class="modal" style="max-width:400px" [formGroup]="addForm" (ngSubmit)="add()" (click)="$event.stopPropagation()">
          <h3>Add table</h3>
          <div class="form-group"><label for="tn">Table name</label><input id="tn" formControlName="name" />
            @if (addForm.controls.name.touched && addForm.controls.name.invalid) { <span class="error">Enter a table name</span> }</div>
          <div class="form-group"><label for="ts">Seats</label><input id="ts" type="number" formControlName="seats" />
            @if (addForm.controls.seats.touched && addForm.controls.seats.invalid) { <span class="error">Seats must be between 1 and 20</span> }</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="showAdd.set(false)">Cancel</button>
            <button class="btn btn-primary" type="submit">Add table</button>
          </div>
        </form>
      </div>
    }

    @if (reserving(); as t) {
      <div class="modal-backdrop" (click)="reserving.set(null)">
        <form class="modal" style="max-width:400px" [formGroup]="reserveForm" (ngSubmit)="reserve(t)" (click)="$event.stopPropagation()">
          <h3>Reserve {{ t.name }}</h3>
          <div class="form-group"><label for="rn">Guest name</label><input id="rn" formControlName="name" />
            @if (reserveForm.controls.name.touched && reserveForm.controls.name.invalid) { <span class="error">Enter the guest name</span> }</div>
          <div class="form-group"><label for="rt">Date and time</label><input id="rt" type="datetime-local" formControlName="time" />
            @if (reserveForm.controls.time.touched && reserveForm.controls.time.invalid) { <span class="error">Choose a date and time</span> }</div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="reserving.set(null)">Cancel</button>
            <button class="btn btn-primary" type="submit">Reserve table</button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    .tbl { border-top: 6px solid var(--success); }
    .tbl.s-occupied { border-top-color: var(--danger); } .tbl.s-reserved { border-top-color: var(--gold); }
    .tbl h3 { font-size: 20px; } .tbl p { margin: 6px 0 10px; } .res { font-weight: 600; }
  `],
})
export class TablesComponent {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);
  private confirm = inject(ConfirmService);
  tables = inject(TableService);

  showAdd = signal(false);
  reserving = signal<RestaurantTable | null>(null);
  private counts = computed(() => {
    const c: Record<string, number> = { Available: 0, Occupied: 0, Reserved: 0 };
    this.tables.items().forEach((t) => c[t.status]++);
    return c;
  });
  count(s: string) { return this.counts()[s] ?? 0; }

  addForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    seats: [4, [Validators.required, Validators.min(1), Validators.max(20)]],
  });
  reserveForm = this.fb.nonNullable.group({ name: ['', Validators.required], time: ['', Validators.required] });

  openAdd() {
    this.addForm.reset({ name: 'Table ' + (this.tables.items().length + 1), seats: 4 });
    this.showAdd.set(true);
  }
  add() {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    this.tables.add({ ...this.addForm.getRawValue(), status: 'Available' });
    this.notify.success('Table added.');
    this.showAdd.set(false);
  }

  openReserve(t: RestaurantTable) {
    this.reserveForm.reset({ name: '', time: '' });
    this.reserving.set(t);
  }
  reserve(t: RestaurantTable) {
    if (this.reserveForm.invalid) { this.reserveForm.markAllAsTouched(); return; }
    const v = this.reserveForm.getRawValue();
    this.tables.setStatus(t.id, 'Reserved', v.name, v.time);
    this.notify.success(`${t.name} reserved for ${v.name}.`);
    this.reserving.set(null);
  }

  setStatus(t: RestaurantTable, status: 'Available' | 'Occupied') {
    this.tables.setStatus(t.id, status);
    this.notify.success(`${t.name} is now ${status.toLowerCase()}.`);
  }

  async remove(t: RestaurantTable) {
    if (await this.confirm.ask(`Delete ${t.name}?`)) {
      this.tables.remove(t.id);
      this.notify.success('Table deleted.');
    }
  }
}
