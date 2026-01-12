import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { PharmacyService } from '../../../services/pharmacy.service';
import { OrderService } from '../../../services/order.service';
import { Pharmacy } from '../../../models/pharmacy.model';
import { Order, OrderStatus } from '../../../models/order.model';
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

    constructor(
        private authService: AuthService,
        private pharmacyService: PharmacyService,
        private orderService: OrderService,
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

                this.calculateStatistics(orders);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading orders', err);
                // We still want to show the dashboard even if orders fail
                this.isLoading = false;
            }
        });
    }

    calculateStatistics(orders: Order[]): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // 1. Daily Orders (Today)
        this.dailyOrdersCount = orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        }).length;

        // 2. Monthly Revenue
        this.monthlyRevenue = orders
            .filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate.getMonth() === currentMonth &&
                    orderDate.getFullYear() === currentYear &&
                    o.status !== OrderStatus.CANCELLED;
            })
            .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // 3. Active Deliveries (In Transit)
        this.activeDeliveriesCount = orders.filter(o =>
            o.status === OrderStatus.DELIVERING || o.status === OrderStatus.READY
        ).length;
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
