import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login">
      <section class="hero">
        <div class="hero-brand"><span class="brand-mark"><i class="fa-solid fa-utensils"></i></span><b>TableNest</b></div>
        <div class="hero-copy">
          <p class="tag">RESTAURANT OPERATIONS, SIMPLIFIED</p>
          <h1>Run your restaurant.<br><span>Flow with ease.</span></h1>
          <p class="sub">Manage your daily orders and menu from one simple workspace.</p>
        </div>
        <div class="hero-foot"><span class="live-dot"></span> Your restaurant, in sync.</div>
      </section>
      <section class="panel">
        <form class="box" [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-heading"><span class="eyebrow">WELCOME BACK</span><h2>Sign in to TableNest</h2><p>Enter your account details to continue.</p></div>
          <div class="form-group">
            <label for="u">Username</label>
            <input id="u" formControlName="username" autocomplete="username" placeholder="Enter your username" />
            @if (form.controls.username.touched && form.controls.username.invalid) { <span class="error">Enter your username</span> }
          </div>
          <div class="form-group">
            <label for="p">Password</label>
            <input id="p" type="password" formControlName="password" autocomplete="current-password" placeholder="Enter your password" />
            @if (form.controls.password.touched && form.controls.password.invalid) { <span class="error">Enter your password</span> }
          </div>
          <button class="btn btn-primary sign-in" type="submit">Sign in <i class="fa-solid fa-arrow-right"></i></button>
          <div class="demo">
            <span>Want to try the demo?</span>
            <button type="button" (click)="fill('admin','admin123')">
              <i class="fa-solid fa-user"></i> Use demo account
            </button>
          </div>
          <p class="secure-note"><i class="fa-solid fa-shield-halved"></i> Your simple restaurant workspace</p>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .login{min-height:100vh;display:grid;grid-template-columns:1.08fr .92fr;background:#050914;isolation:isolate;overflow:hidden}
    .hero{min-height:100vh;padding:42px clamp(28px,6vw,88px);background:radial-gradient(ellipse at 18% 18%,rgba(40,120,240,.25),transparent 36%),radial-gradient(ellipse at 82% 78%,rgba(22,199,154,.17),transparent 34%),radial-gradient(ellipse at 58% 35%,rgba(139,92,246,.13),transparent 38%),linear-gradient(135deg,#081225,#0b1425 52%,#090f1d);display:flex;flex-direction:column;position:relative;overflow:hidden}
    .hero:before,.hero:after{content:"";position:absolute;pointer-events:none;border-radius:50%}
    .hero:before{width:380px;height:380px;right:-115px;top:18%;border:1px solid rgba(91,160,255,.2);box-shadow:0 0 0 35px rgba(91,160,255,.035),0 0 0 75px rgba(139,92,246,.025),0 0 90px rgba(40,120,240,.12);animation:orbit 18s linear infinite}
    .hero:after{width:230px;height:230px;left:-100px;bottom:-85px;background:radial-gradient(circle,rgba(22,199,154,.18),transparent 70%);animation:floatGlow 7s ease-in-out infinite alternate}
    .hero-brand{display:flex;align-items:center;gap:12px;color:#f1f6ff;font-size:20px;letter-spacing:-.04em;position:relative;z-index:2;animation:fadeDown .7s ease both}
    .brand-mark{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;color:#fff;background:linear-gradient(135deg,#2878f0,#7958ef 58%,#e65aa8);box-shadow:0 8px 28px rgba(75,105,240,.28);animation:brandPulse 4s ease-in-out infinite}
    .hero-copy{margin:auto 0;max-width:600px;position:relative;z-index:1;animation:fadeUp .85s .12s ease both}
    .tag,.eyebrow{background:linear-gradient(90deg,#69b5ff,#8c7bff,#45dfb6,#f0b65c);background-size:220% auto;-webkit-background-clip:text;background-clip:text;color:transparent;font-size:10px;font-weight:800;letter-spacing:.16em;animation:colorDrift 8s linear infinite}
    .hero h1{color:#f3f7ff;font-size:clamp(38px,5vw,64px);line-height:1.08;letter-spacing:-.055em;margin:18px 0}
    .hero h1 span{background:linear-gradient(100deg,#62b5ff,#9b83ff 38%,#48dfb4 72%,#ffc36b);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:colorDrift 7s linear infinite}
    .sub{max-width:440px;color:#a7b5cb;font-size:15px;line-height:1.8}
    .hero-foot{display:flex;align-items:center;gap:9px;color:#8294b1;font-size:12px;position:relative;z-index:1;animation:fadeUp .8s .35s ease both}
    .live-dot{width:7px;height:7px;border-radius:50%;background:#4bd39a;box-shadow:0 0 0 4px rgba(75,211,154,.12);animation:livePulse 2s ease-out infinite}
    .panel{display:flex;align-items:center;justify-content:center;padding:36px 24px;background:radial-gradient(ellipse at 80% 12%,rgba(121,88,239,.11),transparent 36%),radial-gradient(ellipse at 10% 90%,rgba(22,199,154,.09),transparent 35%),#070d19;position:relative}
    .panel:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 15%,rgba(255,255,255,.018) 48%,transparent 78%);background-size:200% 100%;animation:panelSweep 12s ease-in-out infinite}
    .box{width:100%;max-width:410px;padding:clamp(24px,4vw,42px);border:1px solid rgba(105,145,205,.23);border-radius:22px;background:linear-gradient(145deg,rgba(17,29,51,.96),rgba(10,18,34,.97));box-shadow:0 24px 80px rgba(0,0,0,.38),0 0 55px rgba(40,120,240,.07);position:relative;z-index:1;animation:cardEnter .8s cubic-bezier(.2,.8,.2,1) both}
    .box:before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;background:linear-gradient(135deg,rgba(65,157,255,.55),rgba(139,92,246,.28),rgba(22,199,154,.4),transparent 75%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;opacity:.65}
    .form-heading{margin-bottom:28px}.form-heading h2{font-size:25px;letter-spacing:-.04em;margin:8px 0 5px}.form-heading p{margin:0;color:#91a0b8;font-size:13px}
    .form-group{margin-bottom:18px}.form-group label{color:#c6d4e9}.form-group input{min-height:49px;background:#091326;border-color:#263957;transition:border-color .25s,box-shadow .25s,transform .25s}
    .form-group input:focus{border-color:#5b9dff;box-shadow:0 0 0 3px rgba(40,120,240,.16),0 0 22px rgba(40,120,240,.1);transform:translateY(-1px)}
    .sign-in{width:100%;min-height:50px;justify-content:center;margin-top:4px;position:relative;overflow:hidden;background:linear-gradient(100deg,#2878f0,#7958ef 48%,#16bfa0);background-size:200% auto;color:white;box-shadow:0 8px 24px rgba(40,120,240,.2);transition:background-position .4s,transform .25s,box-shadow .25s}
    .sign-in:hover{background-position:100% center;transform:translateY(-2px);box-shadow:0 12px 30px rgba(88,111,240,.3)}.sign-in:after{content:"";position:absolute;top:-50%;left:-45%;width:28%;height:200%;background:rgba(255,255,255,.22);transform:rotate(22deg);transition:left .65s ease}.sign-in:hover:after{left:130%}
    .demo{margin-top:26px;padding-top:20px;border-top:1px solid #263650;display:flex;flex-direction:column;gap:7px}.demo>span{color:#8195b4;font-size:11px;margin-bottom:3px}
    .demo button{min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 11px;border:1px solid #293b58;border-radius:10px;background:linear-gradient(100deg,rgba(40,120,240,.08),rgba(121,88,239,.06),rgba(22,199,154,.05));color:#dce8fa;cursor:pointer;text-align:left;transition:transform .2s,border-color .2s,background .2s}
    .demo button:hover{border-color:#628ce0;background:rgba(40,120,240,.14);transform:translateY(-1px)}.demo button{justify-content:center;font-size:12px;font-weight:650}
    .secure-note{margin:22px 0 0;text-align:center;color:#7184a2;font-size:10px}.secure-note i{background:linear-gradient(90deg,#55aaff,#a18aff,#4cdbb1);-webkit-background-clip:text;background-clip:text;color:transparent;margin-right:5px}
    @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes cardEnter{from{opacity:0;transform:translateY(22px) scale(.985);filter:blur(5px)}to{opacity:1;transform:none;filter:blur(0)}}@keyframes orbit{to{transform:rotate(360deg)}}@keyframes floatGlow{from{transform:translate(0,0) scale(.9)}to{transform:translate(30px,-22px) scale(1.15)}}@keyframes brandPulse{0%,100%{box-shadow:0 8px 28px rgba(75,105,240,.22)}50%{box-shadow:0 8px 34px rgba(22,199,154,.3)}}@keyframes livePulse{0%{box-shadow:0 0 0 0 rgba(75,211,154,.35)}70%{box-shadow:0 0 0 7px rgba(75,211,154,0)}100%{box-shadow:0 0 0 0 rgba(75,211,154,0)}}@keyframes colorDrift{to{background-position:220% center}}@keyframes panelSweep{0%,100%{background-position:100% 0}50%{background-position:0 0}}
    /* Simplified motion: keep only a short, gentle form entrance. */
    .hero:before,.hero:after,.brand-mark,.tag,.eyebrow,.hero h1 span,.live-dot,.panel:before { animation:none !important; }
    .box { animation:cardEnter .45s ease both; }
    .sign-in:after { display:none; }
    .demo button:hover { transform:translateY(-1px); }
    @media(max-width:800px){.login{grid-template-columns:1fr}.hero{min-height:290px;padding:25px 24px 30px}.hero-copy{margin:35px 0 28px}.hero h1{font-size:38px;margin:10px 0}.hero .sub{font-size:13px;margin-bottom:0}.hero-foot{display:none}.panel{align-items:flex-start;padding:24px 16px 36px}.box{max-width:480px}}
    @media(prefers-reduced-motion:reduce){.hero:before,.hero:after,.hero-brand,.hero-copy,.hero-foot,.brand-mark,.tag,.eyebrow,.hero h1 span,.live-dot,.panel:before,.box,.sign-in,.demo button{animation:none!important;transition:none!important}}
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notify = inject(NotificationService);
  settings = inject(SettingsService);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    if (this.auth.isLoggedIn()) this.router.navigateByUrl('/dashboard');
  }

  fill(u: string, p: string) { this.form.setValue({ username: u, password: p }); }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { username, password } = this.form.getRawValue();
    if (this.auth.login(username, password)) {
      this.notify.success('Welcome back to TableNest!');
      this.router.navigateByUrl('/dashboard');
    } else {
      this.notify.error('Wrong username or password. Try one of the demo logins.');
    }
  }
}
