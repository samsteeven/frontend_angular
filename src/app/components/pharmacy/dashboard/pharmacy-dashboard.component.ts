import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { PharmacyService } from '../../../services/pharmacy.service';
import { Pharmacy } from '../../../models/pharmacy.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-pharmacy-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pharmacy-dashboard.component.html'
})
export class PharmacyDashboardComponent implements OnInit {
    currentUser: any = null;
    pharmacy: Pharmacy | null = null;
    isLoading = true;
    errorMessage: string | null = null;

    constructor(
        private authService: AuthService,
        private pharmacyService: PharmacyService,
        private router: Router
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.checkPharmacyStatus();
    }

    checkPharmacyStatus(): void {
        const pharmacyId = this.authService.getUserPharmacyId();

        if (this.authService.isPharmacyAdmin()) {
            if (!pharmacyId) {
                // No pharmacy - redirect to create
                this.authService.getProfile().subscribe({
                    next: (user) => {
                        if (!user.pharmacyId) {
                            this.router.navigate(['/pharmacy-admin/create-pharmacy']);
                        } else {
                            // User has pharmacy ID now, fetch pharmacy details
                            this.loadPharmacyDetails(user.pharmacyId);
                        }
                    },
                    error: () => {
                        this.router.navigate(['/pharmacy-admin/create-pharmacy']);
                    }
                });
            } else {
                // Has pharmacy - fetch details
                this.loadPharmacyDetails(pharmacyId);
            }
        } else {
            // For employees, just show dashboard
            if (pharmacyId) {
                this.loadPharmacyDetails(pharmacyId);
            } else {
                this.isLoading = false;
            }
        }
    }

    loadPharmacyDetails(pharmacyId: string): void {
        this.pharmacyService.getById(pharmacyId).subscribe({
            next: (pharmacy) => {
                this.pharmacy = pharmacy;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading pharmacy details', err);
                this.errorMessage = "Impossible de charger les informations de la pharmacie.";
                this.isLoading = false;
            }
        });
    }

    get isPending(): boolean {
        return this.pharmacy?.status === 'PENDING';
    }

    get isApproved(): boolean {
        return this.pharmacy?.status === 'APPROVED';
    }

    get isRejected(): boolean {
        return this.pharmacy?.status === 'REJECTED';
    }

    get isSuspended(): boolean {
        return this.pharmacy?.status === 'SUSPENDED';
    }
}
