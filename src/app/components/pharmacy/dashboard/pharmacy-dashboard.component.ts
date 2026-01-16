import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { PharmacyService } from '../../../services/pharmacy.service';
import { OrderService } from '../../../services/order.service';
import { Pharmacy } from '../../../models/pharmacy.model';
import { Order, OrderStatus } from '../../../models/order.model';
import { EmployeePermissionService } from '../../../services/employee-permission.service';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faCircleNotch, faClock, faTimesCircle, faExclamationTriangle,
    faPlus, faShoppingBag, faCoins, faExclamationCircle,
    faTruck, faHistory, faStore, faCheckCircle, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-pharmacy-dashboard',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule, RouterLink],
    templateUrl: './pharmacy-dashboard.component.html'
})
export class PharmacyDashboardComponent implements OnInit {
    faCircleNotch = faCircleNotch;
    faClock = faClock;
    faTimesCircle = faTimesCircle;
    faExclamationTriangle = faExclamationTriangle;
    faPlus = faPlus;
    faShoppingBag = faShoppingBag;
    faCoins = faCoins;
    faExclamationCircle = faExclamationCircle;
    faTruck = faTruck;
    faHistory = faHistory;
    faStore = faStore;
    faCheckCircle = faCheckCircle;
    faInfoCircle = faInfoCircle;

    currentUser: any = null;
    pharmacy: Pharmacy | null = null;
    recentOrders: Order[] = [];
    isLoading = true;
    errorMessage: string | null = null;

    // Statistics
    dailyOrdersCount = 0;
    monthlyRevenue = 0;
    activeDeliveriesCount = 0;
    lowStockCount = 0;
    expiringSoonCount = 0;

    constructor(
        private authService: AuthService,
        private pharmacyService: PharmacyService,
        private orderService: OrderService,
        private permissionService: EmployeePermissionService,
        private router: Router
    ) {
        // Initialize with basic user data from localStorage
        this.currentUser = this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        // Load complete user profile from backend
        this.authService.getProfile().subscribe({
            next: (user) => {
                this.currentUser = user;
            },
            error: (err) => {
                console.error('Error loading user profile', err);
                // Continue with localStorage data if API fails
            }
        });

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
                this.loadRecentOrders(pharmacyId);
                this.loadInventoryStats(pharmacyId);
            },
            error: (err) => {
                console.error('Error loading pharmacy details', err);
                this.errorMessage = "Impossible de charger les informations de la pharmacie.";
                this.isLoading = false;
            }
        });
    }

    loadRecentOrders(pharmacyId: string): void {
        this.orderService.getPharmacyOrders(pharmacyId).subscribe({
            next: (orders) => {
                // Sort by date descending and take top 5
                this.recentOrders = [...orders]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);

                this.loadBackendStatistics(pharmacyId);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading orders', err);
                // We still want to show the dashboard even if orders fail
                this.isLoading = false;
            }
        });
    }

    loadBackendStatistics(pharmacyId: string): void {
        const userId = this.currentUser?.id;
        if (!userId) return;

        this.permissionService.getStatistics(userId).subscribe({
            next: (stats) => {
                this.dailyOrdersCount = stats.dailyOrders || 0;
                this.monthlyRevenue = stats.monthlyRevenue || 0;
                this.activeDeliveriesCount = stats.activeDeliveries || 0;
                // lowStockCount is still from local inventory check for better precision
            },
            error: (err) => console.error('Error loading backend stats', err)
        });
    }

    exportReport(): void {
        const userId = this.currentUser?.id;
        if (!userId) return;

        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago

        this.permissionService.exportReport(userId, startDate, endDate).subscribe({
            next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rapport-activite-${userId}-${endDate}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            },
            error: (err) => {
                console.error('Error exporting report', err);
                alert('Erreur lors de la génération du rapport.');
            }
        });
    }

    formatStatus(status: string): string {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'CONFIRMED': return 'Confirmée';
            case 'PREPARING': return 'En préparation';
            case 'READY': return 'Prête';
            case 'DELIVERING': return 'En livraison';
            case 'DELIVERED': return 'Livrée';
            case 'CANCELLED': return 'Annulée';
            default: return status;
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'PENDING': return 'bg-slate-100 text-slate-800 border-slate-200';
            case 'CONFIRMED': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'PREPARING': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'READY': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'DELIVERING': return 'bg-violet-50 text-violet-700 border-violet-200';
            case 'DELIVERED': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    }

    loadInventoryStats(pharmacyId: string): void {
        this.pharmacyService.getInventory(pharmacyId).subscribe({
            next: (inventory) => {
                // Threshold for low stock is 5
                this.lowStockCount = inventory.filter(i => i.stock > 0 && i.stock < 5).length;

                // Threshold for expiring soon is 90 days
                const ninetyDaysFromNow = new Date();
                ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

                this.expiringSoonCount = inventory.filter(i => {
                    if (!i.expiryDate) return false;
                    const expiryDate = new Date(i.expiryDate);
                    return expiryDate > new Date() && expiryDate <= ninetyDaysFromNow;
                }).length;
            },
            error: (err) => {
                console.error('Error loading inventory stats', err);
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
