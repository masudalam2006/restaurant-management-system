import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Role } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service';
import { SettingsService } from '../../services/settings.service';

interface NavItem { path: string; label: string; icon: string; roles: Role[]; }
const ALL: Role[] = ['Admin', 'Manager', 'Chef', 'Waiter', 'Cashier'];

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell" [class.open]="menuOpen()">
      <aside class="sidebar no-print" id="primary-navigation" aria-label="Main navigation">
        <a class="brand" routerLink="/dashboard" (click)="menuOpen.set(false)" aria-label="TableNest home">
          <span class="brand-mark"><i class="fa-solid fa-utensils"></i></span>
          <span class="brand-copy"><b>TableNest</b><small>Simple restaurant workspace</small></span>
          <button class="close-menu" type="button" aria-label="Close navigation" (click)="menuOpen.set(false)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </a>
        <div class="nav-caption">MAIN MENU</div>
        <nav>
          @for (n of navItems(); track n.path) {
            <a [routerLink]="n.path" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
               (click)="menuOpen.set(false)" [attr.aria-label]="n.label">
              <i [class]="n.icon" aria-hidden="true"></i><span>{{ n.label }}</span>
            </a>
          }
        </nav>
        <div class="sidebar-bottom">
          <div class="account-chip">
            <span class="avatar">{{ (auth.user()?.name || 'U').slice(0, 1).toUpperCase() }}</span>
            <span class="account-copy"><b>{{ auth.user()?.name }}</b><small>{{ auth.user()?.role }}</small></span>
          </div>
          <button class="logout" type="button" (click)="logout()">
            <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i><span>Sign out</span>
          </button>
        </div>
      </aside>
      <button class="backdrop no-print" type="button" aria-label="Close navigation menu" (click)="menuOpen.set(false)"></button>

      <div class="main">
        <header class="topbar no-print">
          <button class="burger" type="button" (click)="menuOpen.set(true)" aria-controls="primary-navigation"
                  [attr.aria-expanded]="menuOpen()" aria-label="Open navigation menu">
            <i class="fa-solid fa-bars" aria-hidden="true"></i>
          </button>
          <div class="topbar-title"><span class="eyebrow">DINEFLOW MAIN MENU</span><strong>TableNest</strong></div>
          <div class="who"><span class="status-dot"></span><span>{{ auth.user()?.role }}</span></div>
        </header>
        <main class="content" id="main-content"><router-outlet /></main>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; }
    .shell { min-height:100vh; }
    .sidebar { width:258px; position:fixed; inset:0 auto 0 0; z-index:50; display:flex; flex-direction:column; padding:22px 16px 18px; background:#081225; border-right:1px solid #1e2d45; color:#eef4ff; }
    .brand { display:flex; align-items:center; gap:12px; padding:4px 7px 26px; color:#f7faff; }
    .brand-mark { width:40px; height:40px; border-radius:12px; display:grid; place-items:center; background:rgba(40,120,240,.16); color:#70aaff; font-size:17px; }
    .brand-copy { display:flex; flex-direction:column; line-height:1.25; }
    .brand b { font-size:19px; letter-spacing:-.04em; font-weight:750; }
    .brand small { color:#8192ad; font-size:10px; margin-top:3px; letter-spacing:.035em; }
    .close-menu { display:none; margin-left:auto; border:0; background:transparent; color:#c4d1c9; width:42px; height:42px; border-radius:10px; font-size:18px; }
    .nav-caption { color:#7184a3; font-size:10px; font-weight:750; letter-spacing:.13em; padding:0 12px 10px; }
    nav { display:flex; flex-direction:column; gap:5px; flex:1; overflow-y:auto; }
    nav a { display:flex; align-items:center; gap:13px; min-height:46px; padding:10px 13px; border-radius:10px; color:#aebbd0; font-size:13px; font-weight:600; transition:background .18s,color .18s; }
    nav a i { width:19px; text-align:center; font-size:15px; color:#8295b4; }
    nav a:hover { background:#142541; color:#f5f8ff; }
    nav a.active { background:rgba(40,120,240,.16); color:#8ab8ff; box-shadow:inset 2px 0 #2878f0; }
    nav a.active i { color:#8ab8ff; }
    .sidebar-bottom { border-top:1px solid #1e2d45; padding-top:15px; }
    .account-chip { display:flex; align-items:center; gap:10px; padding:6px 5px 12px; min-width:0; }
    .avatar { width:34px; height:34px; border-radius:50%; display:grid; place-items:center; background:#1a3154; color:#8ab8ff; font-weight:750; }
    .account-copy { display:flex; flex-direction:column; min-width:0; }
    .account-copy b { font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .account-copy small { color:#8192ad; font-size:10px; margin-top:2px; }
    .logout { width:100%; min-height:44px; display:flex; align-items:center; gap:12px; padding:10px 12px; border:1px solid #263852; border-radius:10px; background:transparent; color:#b5c4dc; font-weight:600; font-size:12px; cursor:pointer; text-align:left; }
    .logout:hover { background:#142541; color:#fff; }
    .main { min-height:100vh; margin-left:258px; min-width:0; }
    .topbar { min-height:72px; display:flex; align-items:center; gap:14px; padding:12px 30px; background:rgba(5,11,24,.94); border-bottom:1px solid #25332c; position:sticky; top:0; z-index:20; backdrop-filter:blur(14px); }
    .topbar-title { display:flex; flex-direction:column; gap:2px; flex:1; }
    .topbar-title .eyebrow { font-size:9px; font-weight:750; letter-spacing:.13em; color:#6f897b; }
    .topbar-title strong { font-size:13px; font-weight:650; color:#dce7f7; }
    .who { display:flex; align-items:center; gap:8px; color:#b5c4dc; font-size:12px; font-weight:650; padding:8px 12px; border:1px solid #263852; border-radius:99px; }
    .status-dot { width:7px; height:7px; border-radius:50%; background:#2878f0; box-shadow:0 0 0 3px rgba(40,120,240,.16); }
    .burger { display:none; border:1px solid #263852; background:#101e34; color:#e4eee8; border-radius:10px; width:46px; height:46px; font-size:17px; cursor:pointer; touch-action:manipulation; }
    .content { padding:28px 30px 40px; max-width:1600px; margin:0 auto; }
    .backdrop { display:none; }
    @media (max-width:900px) {
      .sidebar { width:min(300px,86vw); transform:translateX(-105%); transition:transform .24s ease; box-shadow:18px 0 50px rgba(0,0,0,.35); }
      .open .sidebar { transform:translateX(0); }
      .close-menu { display:block; }
      .open .backdrop { display:block; position:fixed; inset:0; z-index:40; border:0; background:rgba(0,0,0,.68); }
      .main { margin-left:0; }
      .burger { display:grid; place-items:center; }
      .topbar { min-height:66px; padding:10px 16px; }
      .content { padding:20px 16px 32px; }
    }
    @media (max-width:480px) {
      .topbar-title .eyebrow { display:none; }
      .topbar-title strong { font-size:12px; }
      .who { padding:7px 9px; font-size:11px; }
    }
    @media (prefers-reduced-motion:reduce) { .sidebar,nav a { transition:none; } }
  `],
})
export class LayoutComponent {
  auth = inject(AuthService);
  settings = inject(SettingsService);
  private router = inject(Router);
  private confirm = inject(ConfirmService);
  menuOpen = signal(false);

  private nav: NavItem[] = [
    { path: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie', roles: ALL },
    { path: 'orders', label: 'Orders', icon: 'fa-solid fa-receipt', roles: ALL },
    { path: 'menu', label: 'Menu', icon: 'fa-solid fa-utensils', roles: ALL },
    { path: 'tables', label: 'Tables', icon: 'fa-solid fa-chair', roles: ALL },
  ];
  navItems = computed(() => {
    const role = this.auth.user()?.role;
    return this.nav.filter((n) => !!role && n.roles.includes(role));
  });

  async logout() {
    if (await this.confirm.ask('Do you want to log out of TableNest?', 'Sign out', 'Sign out')) {
      this.auth.logout();
      this.router.navigateByUrl('/login');
    }
  }
}
