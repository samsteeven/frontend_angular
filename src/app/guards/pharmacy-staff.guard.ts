import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const pharmacyStaffGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        return router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
        });
    }

    // Check if user is pharmacy staff (admin or employee)
    if (authService.isPharmacyStaff()) {
        return true;
    }

    // Redirect based on user role
    if (authService.isSuperAdmin()) {
        return router.createUrlTree(['/admin/dashboard']);
    }

    return router.createUrlTree(['/login']);
};
