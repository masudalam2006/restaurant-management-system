import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/models';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};

/** Use with route data: { roles: ['Admin', 'Manager'] } */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const roles = (route.data['roles'] ?? []) as Role[];
  return auth.hasRole(roles) ? true : inject(Router).createUrlTree(['/dashboard']);
};
