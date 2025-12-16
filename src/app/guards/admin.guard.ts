import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
  // Vérifier si l'utilisateur est admin
  if (authService.isAdmin()) {
    return true;
  }

  // Rediriger selon le rôle de l'utilisateur
  const role = authService.getCurrentRole();

  switch (role) {
    case 'CLIENT':
      return router.createUrlTree(['/client/dashboard']);
    case 'COLLECTEUR':
      return router.createUrlTree(['/collecteur/dashboard']);
    default:
      return router.createUrlTree(['/login']);
  }
};