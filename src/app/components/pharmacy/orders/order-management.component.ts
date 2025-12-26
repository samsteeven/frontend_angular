import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { DeliveryAssignmentService, Courier } from '../../../services/delivery-assignment.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearch,
  faFilter,
  faEye,
  faCheck,
  faBoxOpen,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faSpinner,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestion des Commandes</h1>
          <p class="text-gray-500">Gérez et suivez les commandes de votre pharmacie</p>
        </div>
        
        <!-- Status Filter -->
        <div class="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200 overflow-x-auto max-w-full">
          <button 
            *ngFor="let status of filterStatuses"
            (click)="currentFilter = status"
            [class.bg-blue-600]="currentFilter === status"
            [class.text-white]="currentFilter === status"
            [class.text-gray-600]="currentFilter !== status"
            class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap">
            {{ formatStatus(status) }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-20">
        <fa-icon [icon]="faSpinner" [class.fa-spin]="true" class="text-4xl text-blue-600"></fa-icon>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
        <div class="flex items-center">
          <fa-icon [icon]="faTimesCircle" class="text-red-500 mr-2"></fa-icon>
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
        <button (click)="loadOrders()" class="mt-2 text-sm text-red-600 font-semibold hover:underline">Réessayer</button>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading && !errorMessage">
        
        <!-- Empty State -->
        <div *ngIf="filteredOrders.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <div class="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <fa-icon [icon]="faBoxOpen" class="text-2xl text-blue-500"></fa-icon>
          </div>
          <h3 class="text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
          <p class="text-gray-500 mt-1">Il n'y a pas de commandes correspondant au filtre "{{ formatStatus(currentFilter) }}"</p>
        </div>

        <!-- Orders Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="filteredOrders.length > 0">
          <div *ngFor="let order of filteredOrders" 
               class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            
            <!-- Header -->
            <div class="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                      [ngClass]="getStatusColor(order.status)">
                  {{ formatStatus(order.status) }}
                </span>
                <p class="text-xs text-gray-500 mt-2">#{{ order.id.slice(0, 8) }}</p>
                <p class="text-xs text-gray-400">{{ order.createdAt | date:'dd MMM yyyy, HH:mm' }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-gray-900">{{ order.totalAmount | currency:'XAF':'symbol':'1.0-0' }}</p>
                <p class="text-xs text-gray-500">{{ order.items.length }} articles</p>
              </div>
            </div>

            <!-- Items Preview (First 2) -->
            <div class="p-4 space-y-3">
              <div *ngFor="let item of order.items.slice(0, 2)" class="flex justify-between text-sm">
                <span class="text-gray-700 font-medium truncate pr-2">{{ item.medicationName || 'Médicament' }}</span>
                <span class="text-gray-500 whitespace-nowrap">x{{ item.quantity }}</span>
              </div>
              <div *ngIf="order.items.length > 2" class="text-xs text-blue-600 font-medium italic">
                + {{ order.items.length - 2 }} autres articles...
              </div>
            </div>

            <!-- Customer Info -->
            <div class="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-t border-gray-100 flex items-center gap-2">
                <fa-icon [icon]="faTruck" class="text-gray-400"></fa-icon>
                <span class="truncate">{{ order.deliveryAddress }}</span>
            </div>

            <!-- Actions -->
            <div class="p-4 border-t border-gray-100 flex justify-between items-center gap-2">
              <button class="flex-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                Détails
              </button>
              
              <button *ngIf="order.status === 'PENDING'" 
                      (click)="updateStatus(order, 'CONFIRMED')"
                      [disabled]="isUpdating === order.id"
                      class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
                <fa-icon [icon]="isUpdating === order.id ? faSpinner : faCheck" [class.fa-spin]="isUpdating === order.id"></fa-icon>
                Confirmer
              </button>

              <button *ngIf="order.status === 'CONFIRMED'" 
                      (click)="updateStatus(order, 'PREPARING')"
                      [disabled]="isUpdating === order.id"
                      class="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
                <fa-icon [icon]="isUpdating === order.id ? faSpinner : faBoxOpen" [class.fa-spin]="isUpdating === order.id"></fa-icon>
                Préparer
              </button>

              <button *ngIf="order.status === 'PREPARING'" 
                      (click)="updateStatus(order, 'READY')"
                      [disabled]="isUpdating === order.id"
                      class="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
                <fa-icon [icon]="isUpdating === order.id ? faSpinner : faCheckCircle" [class.fa-spin]="isUpdating === order.id"></fa-icon>
                Prêt
              </button>

              <button *ngIf="order.status === 'READY'" 
                      (click)="openAssignModal(order)"
                      class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2">
                <fa-icon [icon]="faUserTie"></fa-icon>
                Assigner livreur
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Assignment Modal -->
      <div *ngIf="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-xl font-bold text-gray-900">Assigner un livreur</h3>
            <p class="text-sm text-gray-500 mt-1">Commande #{{ selectedOrder?.id?.slice(0, 8) }}</p>
          </div>

          <div class="p-6">
            <div *ngIf="availableCouriers.length === 0" class="text-center py-8">
              <fa-icon [icon]="faUserTie" class="text-4xl text-gray-300 mb-3"></fa-icon>
              <p class="text-gray-500">Aucun livreur disponible</p>
              <p class="text-sm text-gray-400 mt-1">Ajoutez des employés avec le rôle DELIVERY</p>
            </div>

            <div *ngIf="availableCouriers.length > 0" class="space-y-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">Sélectionnez un livreur</label>
              <div *ngFor="let courier of availableCouriers" 
                   (click)="selectedCourierId = courier.id"
                   [class.border-blue-500]="selectedCourierId === courier.id"
                   [class.bg-blue-50]="selectedCourierId === courier.id"
                   class="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ courier.firstName }} {{ courier.lastName }}</p>
                    <p class="text-sm text-gray-500">{{ courier.phone }}</p>
                  </div>
                  <div *ngIf="selectedCourierId === courier.id" class="text-blue-600">
                    <fa-icon [icon]="faCheckCircle" class="text-xl"></fa-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex gap-3">
            <button (click)="closeAssignModal()" 
                    [disabled]="isAssigning"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
              Annuler
            </button>
            <button (click)="assignDelivery()" 
                    [disabled]="!selectedCourierId || isAssigning"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <fa-icon *ngIf="isAssigning" [icon]="faSpinner" [class.fa-spin]="true"></fa-icon>
              {{ isAssigning ? 'Assignation...' : 'Confirmer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrderManagementComponent implements OnInit {
  // Icons
  faSearch = faSearch;
  faFilter = faFilter;
  faEye = faEye;
  faCheck = faCheck;
  faBoxOpen = faBoxOpen;
  faTruck = faTruck;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faClock = faClock;
  faSpinner = faSpinner;
  faUserTie = faUserTie;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = false;
  isUpdating: string | null = null;
  errorMessage: string | null = null;

  currentFilter: string = 'ALL';
  filterStatuses = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'];

  // Delivery Assignment
  showAssignModal = false;
  selectedOrder: Order | null = null;
  availableCouriers: Courier[] = [];
  selectedCourierId: string = '';
  isAssigning = false;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private deliveryService: DeliveryAssignmentService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const pharmacyId = this.authService.getUserPharmacyId();
    if (!pharmacyId) {
      this.errorMessage = "Identifiant de pharmacie non trouvé.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.orderService.getPharmacyOrders(pharmacyId).subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading orders', err);
        this.errorMessage = "Impossible de charger les commandes.";
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.currentFilter === 'ALL') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.currentFilter);
    }
    // Sort by Date DESC
    this.filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get currentFilterValue(): string {
    return this.currentFilter;
  }

  set currentFilterValue(val: string) {
    this.currentFilter = val;
    this.applyFilter();
  }

  // Helper to re-apply filter when variable changes from template
  // Angular Change Detection handles this but simple setter is cleaner if using ngModel (we are using click handler)

  updateStatus(order: Order, newStatus: string): void {
    // Cast string to OrderStatus enum if needed but simple string works often in loose TS if matching backend enum
    const statusEnum = newStatus as OrderStatus;
    this.isUpdating = order.id;

    this.orderService.updateStatus(order.id, statusEnum).subscribe({
      next: (updatedOrder: Order) => {
        // Update local state
        const index = this.orders.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orders[index] = updatedOrder; // Assuming backend returns full updated object
          // OR manually update if backend returns simplified
          // this.orders[index].status = statusEnum; 
        }
        this.applyFilter(); // Re-filter to move items if sort or filter depends on it
        this.isUpdating = null;
      },
      error: (err: any) => {
        console.error('Update failed', err);
        alert("Échec de la mise à jour du statut.");
        this.isUpdating = null;
      }
    });
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'ALL': return 'Tout';
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
      case 'PENDING': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PREPARING': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'READY': return 'bg-green-50 text-green-700 border-green-200';
      case 'DELIVERING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  }

  openAssignModal(order: Order): void {
    this.selectedOrder = order;
    this.showAssignModal = true;
    this.selectedCourierId = '';
    this.loadCouriers();
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedOrder = null;
    this.selectedCourierId = '';
  }

  loadCouriers(): void {
    const pharmacyId = this.authService.getUserPharmacyId();
    if (!pharmacyId) return;

    this.deliveryService.getAvailableCouriers(pharmacyId).subscribe({
      next: (couriers) => {
        this.availableCouriers = couriers.filter(c => c.isActive);
      },
      error: (err) => {
        console.error('Error loading couriers', err);
        alert('Impossible de charger la liste des livreurs.');
      }
    });
  }

  assignDelivery(): void {
    if (!this.selectedOrder || !this.selectedCourierId) return;

    this.isAssigning = true;
    this.deliveryService.assignDelivery(this.selectedOrder.id, this.selectedCourierId).subscribe({
      next: () => {
        alert('Livreur assigné avec succès !');
        this.closeAssignModal();
        this.loadOrders(); // Refresh orders
        this.isAssigning = false;
      },
      error: (err) => {
        console.error('Assignment failed', err);
        alert('Échec de l\'assignation du livreur.');
        this.isAssigning = false;
      }
    });
  }
}
