import { Injectable, signal } from '@angular/core';
import { Settings } from '../models/models';

const KEY = 'rms_settings';
const DEFAULTS: Settings = {
  name: 'TableNest',
  address: '123 Park Street, Kolkata, West Bengal 700016',
  phone: '+91 98765 43210',
  email: 'hello@oceanfeast.in',
  gstPercent: 5,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  readonly settings = signal<Settings>(this.load());

  save(value: Settings) {
    this.settings.set(value);
    localStorage.setItem(KEY, JSON.stringify(value));
  }

  private load(): Settings {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch { return DEFAULTS; }
  }
}
