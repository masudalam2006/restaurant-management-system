import { Injectable } from '@angular/core';
import { RestaurantTable, TableStatus } from '../models/models';
import { LocalStore } from './local-store';

@Injectable({ providedIn: 'root' })
export class TableService extends LocalStore<RestaurantTable> {
  protected override readonly key = 'rms_tables';
  constructor() { super(); this.load(); }

  protected override seed(): RestaurantTable[] {
    const seats = [2, 2, 4, 4, 4, 6, 6, 8, 2, 4];
    return seats.map((s, i) => ({ id: 't' + (i + 1), name: 'Table ' + (i + 1), seats: s, status: 'Available' as TableStatus }));
  }

  setStatus(id: string, status: TableStatus, reservedFor = '', reservedTime = '') {
    this.update(id, { status, reservedFor: status === 'Reserved' ? reservedFor : '', reservedTime: status === 'Reserved' ? reservedTime : '' });
  }
}
