import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const collecteurGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est authentifié
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
  // Vérifier si l'utilisateur est collecteur
  if (authService.isCollecteur()) {
    return true;
  }

  // Rediriger selon le rôle de l'utilisateur
  const role = authService.getCurrentRole();

  switch (role) {
    case 'ADMIN':
      return router.createUrlTree(['/admin/dashboard']);
    case 'CLIENT':
      return router.createUrlTree(['/client/dashboard']);
    default:
      return router.createUrlTree(['/login']);
  }
};