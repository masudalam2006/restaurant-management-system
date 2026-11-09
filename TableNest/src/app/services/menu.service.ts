import { Injectable } from '@angular/core';
import { MenuItem } from '../models/models';
import { LocalStore } from './local-store';

const DEFAULT_RECIPE_IMAGES: Record<string, string> = {
  m1: '/images/recipes/garlic-butter-prawns.jpg',
  m2: '/images/recipes/crispy-fish-fingers.jpg',
  m3: '/images/recipes/butter-garlic-crab.jpg',
  m4: '/images/recipes/grilled-lobster.jpg',
  m5: '/images/recipes/seafood-paella.jpg',
  m6: '/images/recipes/fried-calamari.jpg',
  m7: '/images/recipes/fish-curry-rice.jpg',
  m8: '/images/recipes/prawn-malai-curry.jpg',
  m9: '/images/recipes/chocolate-brownie.jpg',
  m10: '/images/recipes/fresh-lime-soda.jpg',
  m11: '/images/recipes/mango-lassi.jpg',
};

@Injectable({ providedIn: 'root' })
export class MenuService extends LocalStore<MenuItem> {
  protected override readonly key = 'rms_menu';
  constructor() {
    super();
    this.load();
    this.addDefaultPhotos();
  }

  protected override seed(): MenuItem[] {
    const m = (id: string, name: string, category: string, price: number, description: string): MenuItem =>
      ({ id, name, category, price, description, image: DEFAULT_RECIPE_IMAGES[id], available: true });
    return [
      m('m1', 'Garlic Butter Prawns', 'Starters', 220, 'Juicy prawns tossed in garlic butter and parsley.'),
      m('m2', 'Crispy Fish Fingers', 'Starters', 180, 'Golden fried bekti strips with tartare dip.'),
      m('m3', 'Butter Garlic Crab', 'Seafood', 450, 'Whole crab cooked in rich butter garlic sauce.'),
      m('m4', 'Grilled Lobster', 'Seafood', 899, 'Charcoal grilled lobster with lemon herb butter.'),
      m('m5', 'Seafood Paella', 'Seafood', 520, 'Saffron rice with mussels, squid and prawns.'),
      m('m6', 'Fried Calamari', 'Seafood', 320, 'Crunchy squid rings with spicy mayo.'),
      m('m7', 'Fish Curry Rice', 'Main Course', 280, 'Bengali style fish curry served with steamed rice.'),
      m('m8', 'Prawn Malai Curry', 'Main Course', 380, 'Giant prawns in a creamy coconut gravy.'),
      m('m9', 'Chocolate Brownie', 'Desserts', 150, 'Warm brownie with vanilla ice cream.'),
      m('m10', 'Fresh Lime Soda', 'Beverages', 80, 'Sweet, salty or mixed. Served chilled.'),
      m('m11', 'Mango Lassi', 'Beverages', 110, 'Thick yoghurt shake with Alphonso mango.'),
    ];
  }

  private addDefaultPhotos(): void {
    let changed = false;
    this.items.update((items) => items.map((item) => {
      const defaultImage = DEFAULT_RECIPE_IMAGES[item.id];
      if (!defaultImage || (item.image && item.image !== 'images/panner.jpeg' && item.image !== '/images/panner.jpeg')) {
        return item;
      }
      changed = true;
      return { ...item, image: defaultImage };
    }));
    if (changed) this.save();
  }
}
