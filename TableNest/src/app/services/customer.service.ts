import { Injectable } from '@angular/core';
import { Customer } from '../models/models';
import { LocalStore } from './local-store';

@Injectable({ providedIn: 'root' })
export class CustomerService extends LocalStore<Customer> {
  protected override readonly key = 'rms_customers';
  constructor() { super(); this.load(); }

  protected override seed(): Customer[] {
    const now = new Date().toISOString();
    return [
      { id: 'c1', name: 'Sourav Ghosh', phone: '9831012345', email: 'sourav@example.com', createdAt: now },
      { id: 'c2', name: 'Anita Roy', phone: '9830098765', email: 'anita@example.com', createdAt: now },
      { id: 'c3', name: 'Imran Khan', phone: '9903456712', email: 'imran@example.com', createdAt: now },
      { id: 'c4', name: 'Priya Das', phone: '9674123456', email: 'priya@example.com', createdAt: now },
    ];
  }
}
