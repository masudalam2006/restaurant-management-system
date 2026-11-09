import { signal } from '@angular/core';

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Generic CRUD store that keeps a signal in memory and mirrors it to localStorage. */
export abstract class LocalStore<T extends { id: string }> {
  protected abstract readonly key: string;
  protected abstract seed(): T[];

  readonly items = signal<T[]>([]);

  protected load(): void {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        this.items.set(JSON.parse(raw) as T[]);
        return;
      }
    } catch { /* fall through to seed data */ }
    this.items.set(this.seed());
    this.save();
  }

  protected save(): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.items()));
    } catch (e) {
      console.error('Could not save to localStorage', e);
    }
  }

  getById(id?: string | null): T | undefined {
    return this.items().find((i) => i.id === id);
  }

  add(data: Omit<T, 'id'>): T {
    const item = { ...data, id: uid() } as unknown as T;
    this.items.update((list) => [...list, item]);
    this.save();
    return item;
  }

  update(id: string, patch: Partial<T>): void {
    this.items.update((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    this.save();
  }

  remove(id: string): void {
    this.items.update((list) => list.filter((i) => i.id !== id));
    this.save();
  }
}
