import { Component, Input } from '@angular/core';

/** Lightweight CSS bar chart (no external chart library needed). */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  template: `
    <div class="chart" role="img" aria-label="Bar chart">
      @for (v of values; track $index) {
        <div class="col">
          <div class="track">
            <span class="val">{{ short(v) }}</span>
            <div class="bar" [style.height.%]="pct(v)"></div>
          </div>
          <span class="lbl">{{ labels[$index] }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart { display: flex; gap: 10px; align-items: flex-end; height: 240px; overflow-x: auto; padding-top: 6px; }
    .col { flex: 1; min-width: 38px; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
    .track { flex: 1; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; }
    .bar { width: 70%; max-width: 46px; min-height: 3px; border-radius: 10px 10px 4px 4px; background: linear-gradient(180deg, #438dff, #1764d7); transition: height .4s; }
    .val { font-size: 10px; font-weight: 700; color: #b8c9e4; margin-bottom: 4px; }
    .lbl { font-size: 11px; color: var(--muted); white-space: nowrap; }
  `],
})
export class BarChartComponent {
  @Input() labels: string[] = [];
  @Input() values: number[] = [];

  pct(v: number): number {
    const max = Math.max(...this.values, 1);
    return Math.max((v / max) * 85, 1);
  }
  short(v: number): string {
    return v >= 1000 ? (v / 1000).toFixed(1) + 'k' : String(Math.round(v));
  }
}
