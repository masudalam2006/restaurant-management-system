import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CATEGORIES, MenuItem } from '../../models/models';
import { ConfirmService } from '../../services/confirm.service';
import { MenuService } from '../../services/menu.service';
import { NotificationService } from '../../services/notification.service';
import { InrPipe } from '../../shared/inr.pipe';
import { resizeImage } from '../../shared/utils';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ReactiveFormsModule, InrPipe],
  template: `
    <div class="page-header">
      <div><h1>Menu</h1><p>{{ menu.items().length }} dishes on the menu.</p></div>
      <button class="btn btn-primary" (click)="openAdd()"><i class="fa-solid fa-plus"></i> Add food item</button>
    </div>

    <div class="toolbar">
      <div class="search"><i class="fa-solid fa-magnifying-glass"></i>
        <input placeholder="Search food items" [value]="search()" (input)="search.set($any($event.target).value)" aria-label="Search food items" />
      </div>
      <select style="width:200px" [value]="category()" (change)="category.set($any($event.target).value)" aria-label="Filter by category">
        <option value="All">All categories</option>
        @for (c of categories; track c) { <option [value]="c">{{ c }}</option> }
      </select>
    </div>

    <div class="grid cards">
      @for (m of filtered(); track m.id) {
        <article class="card dish" [class.off]="!m.available">
          <div class="pic">
            @if (m.image) { <img [src]="m.image" [alt]="m.name" (error)="onImageError($event)" (load)="onImageLoad($event)" /> }
            <i class="fa-regular fa-image photo-placeholder" aria-hidden="true"></i>
          </div>
          <div class="info">
            <span class="cat">{{ m.category }}</span>
            <h3>{{ m.name }}</h3>
            <p class="muted desc">{{ m.description }}</p>
            <div class="spread">
              <b class="price">{{ m.price | inr }}</b>
              <span [class]="'badge ' + (m.available ? 'badge-available' : 'badge-cancelled')">{{ m.available ? 'Available' : 'Sold out' }}</span>
            </div>
            <div class="row" style="margin-top:12px">
              <button class="btn btn-outline btn-sm" (click)="openEdit(m)"><i class="fa-solid fa-pen"></i> Edit</button>
              <button class="btn btn-outline btn-sm" style="color:var(--danger)" (click)="remove(m)"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
          </div>
        </article>
      } @empty {
        <div class="card empty" style="grid-column:1/-1"><i class="fa-solid fa-bowl-food"></i>No food items match your search. Add a new dish to get started.</div>
      }
    </div>

    @if (showForm()) {
      <div class="modal-backdrop" (click)="showForm.set(false)">
        <form class="modal" [formGroup]="form" (ngSubmit)="save()" (click)="$event.stopPropagation()">
          <h3>{{ editingId ? 'Edit food item' : 'Add food item' }}</h3>
          <div class="form-group">
            <label for="n">Food name</label>
            <input id="n" formControlName="name" />
            @if (form.controls.name.touched && form.controls.name.invalid) { <span class="error">Enter a name (at least 2 letters)</span> }
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="c">Category</label>
              <select id="c" formControlName="category">@for (c of categories; track c) { <option [value]="c">{{ c }}</option> }</select>
            </div>
            <div class="form-group">
              <label for="p">Price (₹)</label>
              <input id="p" type="number" formControlName="price" />
              @if (form.controls.price.touched && form.controls.price.invalid) { <span class="error">Price must be at least ₹1</span> }
            </div>
          </div>
          <div class="form-group"><label for="d">Description</label><textarea id="d" rows="3" formControlName="description"></textarea></div>
          <div class="form-group">
            <label for="f">Food image</label>
            <input id="f" type="file" accept="image/*" (change)="onFile($event)" />
            @if (form.controls.image.value) { <img class="preview" [src]="form.controls.image.value" alt="Preview" /> }
          </div>
          <label class="row" style="margin-bottom:14px"><input type="checkbox" formControlName="available" /> Available for ordering</label>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" (click)="showForm.set(false)">Cancel</button>
            <button type="submit" class="btn btn-primary">Save item</button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    .dish { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
    .dish.off { opacity: .7; }
    .pic { height: 150px; background: linear-gradient(135deg, var(--cream-2), var(--gold)); display: grid; place-items: center; position: relative; }
    .pic img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; }
    .photo-placeholder { color: var(--maroon-700); font-size: 42px; }
    .info { padding: 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .info h3 { font-size: 18px; } .cat { color: var(--orange); font-weight: 700; font-size: 12px; }
    .desc { margin: 0; min-height: 36px; font-size: 13px; } .price { font-size: 17px; color: var(--maroon-700); }
    .preview { width: 120px; height: 90px; object-fit: cover; border-radius: 10px; margin-top: 6px; }
  `],
})
export class MenuComponent {
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);
  private confirm = inject(ConfirmService);
  menu = inject(MenuService);

  categories = CATEGORIES;
  search = signal('');
  category = signal('All');
  showForm = signal(false);
  editingId: string | null = null;

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const c = this.category();
    return this.menu.items().filter((m) => (c === 'All' || m.category === c) && (!q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)));
  });

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: [CATEGORIES[0], Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
    description: [''],
    image: [''],
    available: [true],
  });

  openAdd() {
    this.editingId = null;
    this.form.reset({ name: '', category: CATEGORIES[0], price: 0, description: '', image: '', available: true });
    this.showForm.set(true);
  }

  openEdit(m: MenuItem) {
    this.editingId = m.id;
    this.form.reset({ name: m.name, category: m.category, price: m.price, description: m.description, image: m.image, available: m.available });
    this.showForm.set(true);
  }

  async onFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      this.form.patchValue({ image: await resizeImage(file) });
    } catch {
      this.notify.error('That file could not be used. Choose a JPG or PNG image.');
    }
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).hidden = true;
  }

  onImageLoad(event: Event) {
    (event.target as HTMLImageElement).hidden = false;
  }

  save() {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.notify.error('Please fix the highlighted fields.'); return; }
    const value = this.form.getRawValue();
    if (this.editingId) {
      this.menu.update(this.editingId, value);
      this.notify.success('Food item updated.');
    } else {
      this.menu.add(value);
      this.notify.success('Food item added.');
    }
    this.showForm.set(false);
  }

  async remove(m: MenuItem) {
    if (await this.confirm.ask(`Delete "${m.name}" from the menu? This cannot be undone.`)) {
      this.menu.remove(m.id);
      this.notify.success('Food item deleted.');
    }
  }
}
