import { Injectable } from '@angular/core';
import { Staff } from '../models/models';
import { LocalStore } from './local-store';

@Injectable({ providedIn: 'root' })
export class StaffService extends LocalStore<Staff> {
  protected override readonly key = 'rms_staff';
  constructor() { super(); this.load(); }

  protected override seed(): Staff[] {
    return [
      { id: 's1', name: 'Riya Sen', role: 'Manager', phone: '9830011223', email: 'riya@oceanfeast.in', salary: 42000, joinDate: '2023-02-01' },
      { id: 's2', name: 'Chef Bimal Dey', role: 'Chef', phone: '9831155667', email: 'bimal@oceanfeast.in', salary: 55000, joinDate: '2022-06-15' },
      { id: 's3', name: 'Arjun Mondal', role: 'Waiter', phone: '9836677889', email: 'arjun@oceanfeast.in', salary: 18000, joinDate: '2024-01-10' },
      { id: 's4', name: 'Sneha Paul', role: 'Cashier', phone: '9903322110', email: 'sneha@oceanfeast.in', salary: 22000, joinDate: '2024-05-20' },
    ];
  }
}
