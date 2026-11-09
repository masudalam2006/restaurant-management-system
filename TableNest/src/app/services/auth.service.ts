import { Injectable, computed, signal } from '@angular/core';
import { AppUser, Role } from '../models/models';

const USERS: AppUser[] = [
  { username: 'admin', password: 'admin123', name: 'Admin', role: 'Admin' },
  { username: 'manager', password: 'manager123', name: 'Riya Manager', role: 'Manager' },
  { username: 'waiter', password: 'waiter123', name: 'Arjun Waiter', role: 'Waiter' },
];
const KEY = 'rms_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<Omit<AppUser, 'password'> | null>(this.restore());
  readonly isLoggedIn = computed(() => this.user() !== null);

  login(username: string, password: string): boolean {
    const found = USERS.find((u) => u.username === username.trim() && u.password === password);
    if (!found) return false;
    const { password: _pw, ...session } = found;
    this.user.set(session);
    localStorage.setItem(KEY, JSON.stringify(session));
    return true;
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem(KEY);
  }

  hasRole(roles: Role[]): boolean {
    const u = this.user();
    return !!u && roles.includes(u.role);
  }

  private restore() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
  }
}
