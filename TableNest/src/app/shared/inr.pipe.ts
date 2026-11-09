import { Pipe, PipeTransform } from '@angular/core';

const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

@Pipe({ name: 'inr', standalone: true })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return fmt.format(value ?? 0);
  }
}
