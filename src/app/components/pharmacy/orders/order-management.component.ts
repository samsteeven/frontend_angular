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
  faUserTie,
  faHistory,
  faFileInvoice,
  faCalendarAlt,
  faChevronRight,
  faUser,
  faMapMarkerAlt,
  faChevronDown,
  faPrescription,
  faCapsules,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div class="page-bg-refined p-8 space-y-8 animate-fadeInUp">
      <!-- Header Area -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-semibold text-slate-900 tracking-tight">Gestion des Commandes</h1>
          <p class="mt-1 text-slate-500 font-medium tracking-tight">Suivez et traitez les commandes de médicaments en temps réel dans votre pharmacie.</p>
        </div>
        
        <!-- Status Filter Tabs -->
        <div class="auth-card !p-1 flex bg-slate-100/50 gap-1 overflow-x-auto max-w-full">
          <button 
            *ngFor="let status of filterStatuses"
            (click)="currentFilter = status; applyFilter()"
            [class.bg-white]="currentFilter === status"
            [class.shadow-sm]="currentFilter === status"
            [class.text-indigo-600]="currentFilter === status"
            [class.text-slate-500]="currentFilter !== status"
            class="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap hover:text-indigo-500">
            {{ formatStatus(status) }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex flex-col items-center justify-center py-24">
        <div class="w-12 h-12 mb-4 animate-spin flex items-center justify-center text-indigo-500">
          <fa-icon [icon]="faSpinner" class="text-4xl"></fa-icon>
        </div>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose">Synchronisation des flux...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="auth-card !border-rose-100 !bg-rose-50/30 flex items-center gap-6 animate-shake">
        <div class="icon-container-rose w-14 h-14 !bg-white">
          <fa-icon [icon]="faTimesCircle" class="text-xl"></fa-icon>
        </div>
        <div class="flex-1">
          <h4 class="text-lg font-semibold text-rose-900 tracking-tight">Erreur de chargement</h4>
          <p class="text-rose-700 font-medium text-sm">{{ errorMessage }}</p>
        </div>
        <button (click)="loadOrders()" class="btn-primary !bg-rose-600 hover:!bg-rose-700 shadow-rose-100">
          Réessayer
        </button>
      </div>

      <!-- Main Content -->
      <div *ngIf="!isLoading && !errorMessage" class="space-y-8">
        
        <!-- Empty State -->
        <div *ngIf="filteredOrders.length === 0" class="auth-card !py-24 flex flex-col items-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
          <div class="icon-container-blue w-20 h-20 mb-6 !bg-slate-50 !text-slate-300">
            <fa-icon [icon]="faBoxOpen" class="text-3xl"></fa-icon>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 tracking-tight">Aucune commande</h3>
          <p class="mt-2 text-slate-500 font-medium text-center max-w-sm">Il n'y a actuellement aucune commande avec le statut "{{ formatStatus(currentFilter) }}".</p>
          <button (click)="currentFilter = 'ALL'; applyFilter()" class="mt-8 text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest flex items-center gap-2">
            Voir toutes les commandes <fa-icon [icon]="faChevronRight" class="text-[8px]"></fa-icon>
          </button>
        </div>

        <!-- Orders Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="filteredOrders.length > 0">
          <div *ngFor="let order of filteredOrders" 
               class="auth-card !p-0 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group border-transparent hover:border-indigo-100">
            
            <!-- Order Header -->
            <div class="p-6 bg-slate-50/50 border-b border-slate-100">
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Réf.</span>
                    <span class="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">#{{ order.id.slice(0, 8) }}</span>
                  </div>
                  <div class="flex items-center gap-2 mt-2">
                    <fa-icon [icon]="faCalendarAlt" class="text-slate-300 text-[10px]"></fa-icon>
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{{ order.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <div class="text-2xl font-bold text-slate-900 tracking-tighter">
                    {{ order.totalAmount | currency:'XAF':'symbol':'1.0-0' }}
                  </div>
                  <div class="mt-2 flex justify-end">
                    <span [ngClass]="getStatusColor(order.status)"
                          class="inline-flex px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border">
                      {{ formatStatus(order.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Items Information -->
            <div class="p-6 space-y-4">
              <div *ngFor="let item of order.items.slice(0, 2)" class="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 border border-slate-100 shrink-0 shadow-sm">
                    <fa-icon [icon]="faCapsules" class="text-xs"></fa-icon>
                  </div>
                  <span class="text-xs font-semibold text-slate-700 truncate pr-2 tracking-tight">{{ item.medicationName || 'Pharmaceutique' }}</span>
                </div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">x{{ item.quantity }}</span>
              </div>
              <button *ngIf="order.items.length > 2" class="w-full py-2 text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em] bg-indigo-50/50 rounded-xl hover:bg-indigo-50 transition-colors">
                + {{ order.items.length - 2 }} autres articles
              </button>
            </div>

            <!-- Logistics Detail -->
            <div class="px-6 py-4 bg-slate-50/30 text-[10px] text-slate-500 border-t border-slate-100 flex items-center gap-3">
                <fa-icon [icon]="faMapMarkerAlt" class="text-slate-300 text-xs"></fa-icon>
                <span class="truncate font-bold tracking-tight uppercase tracking-widest leading-relaxed">{{ order.deliveryAddress }}</span>
            </div>

            <!-- Smart Actions -->
            <div class="p-6 border-t border-slate-100 flex gap-3">
              <button class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center shrink-0">
                <fa-icon [icon]="faEye" class="text-sm"></fa-icon>
              </button>
              
              <button *ngIf="order.status === 'PENDING'" 
                      (click)="updateStatus(order, 'CONFIRMED')"
                      [disabled]="isUpdating === order.id"
                      class="flex-1 btn-primary !py-0 h-12 flex justify-center items-center gap-3">
                <fa-icon [icon]="isUpdating === order.id ? faSpinner : faCheck" [animation]="isUpdating === order.id ? 'spin' : undefined"></fa-icon>
                <span class="text-[10px] font-bold uppercase tracking-widest">Confirmer flux</span>
              </button>

              <button *ngIf="order.status === 'CONFIRMED'" 
                      (click)="updateStatus(order, 'PREPARING')"
                      [disabled]="isUpdating === order.id"
                      class="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex justify-center items-center gap-3 transition-all shadow-lg shadow-amber-100">
                <fa-icon [icon]="isUpdating === order.id ? faSpinner : faBoxOpen" [animation]="isUpdating === order.id ? 'spin' : undefined"></fa-icon>
                <span class="text-[10px] font-bold uppercase tracking-widest">Préparation</span>
              </button>

              <button *ngIf="order.status === 'PREPARING'" 
                      (click)="updateStatus(order, 'READY')"
                      [disabled]="isUpdating === order.id"
                      class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex justify-center items-center gap-3 transition-all shadow-lg shadow-emerald-100">
                <fa-icon [icon]="isUpdating === order.id ? faSpinner : faCheckCircle" [animation]="isUpdating === order.id ? 'spin' : undefined"></fa-icon>
                <span class="text-[10px] font-bold uppercase tracking-widest">Aviser Client</span>
              </button>

              <button *ngIf="order.status === 'READY'" 
                      (click)="openAssignModal(order)"
                      class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex justify-center items-center gap-3 transition-all shadow-lg shadow-indigo-100">
                <fa-icon [icon]="faUserTie"></fa-icon>
                <span class="text-[10px] font-bold uppercase tracking-widest">Livreur</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Assignment Modal -->
      <div *ngIf="showAssignModal" class="fixed inset-0 z-[100] overflow-y-auto">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" (click)="closeAssignModal()"></div>

        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="auth-card !p-0 w-full max-w-md overflow-hidden animate-fadeInUp shadow-2xl">
            <div class="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="icon-container-indigo w-12 h-12">
                  <fa-icon [icon]="faUserTie" class="text-xl"></fa-icon>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-slate-900 tracking-tight">Logistique Livraison</h3>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Commande #{{ selectedOrder?.id?.slice(0, 8) }}</p>
                </div>
              </div>
              <button (click)="closeAssignModal()" class="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                <fa-icon [icon]="faTimes"></fa-icon>
              </button>
            </div>

            <div class="p-8">
              <div *ngIf="availableCouriers.length === 0" class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <fa-icon [icon]="faUserTie" class="text-4xl text-slate-200 mb-4"></fa-icon>
                <p class="text-slate-500 font-semibold text-sm tracking-tight">Aucun livreur disponible</p>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 px-4">Activez des livreurs dans la gestion des employés.</p>
              </div>

              <div *ngIf="availableCouriers.length > 0" class="space-y-4">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Livreurs en service</label>
                <div *ngFor="let courier of availableCouriers" 
                     (click)="selectedCourierId = courier.id"
                     [ngClass]="{
                       'border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-sm': selectedCourierId === courier.id,
                       'border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50': selectedCourierId !== courier.id
                     }"
                     class="group border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex items-center gap-4">
                  
                  <div class="icon-container-blue w-12 h-12 shrink-0 group-hover:bg-white transition-colors">
                    <fa-icon [icon]="faUser" class="text-sm"></fa-icon>
                  </div>
                  <div class="flex-1">
                    <p class="font-semibold text-slate-900 tracking-tight transition-colors" [class.text-indigo-600]="selectedCourierId === courier.id">{{ courier.firstName }} {{ courier.lastName }}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ courier.phone }}</p>
                  </div>
                  <div *ngIf="selectedCourierId === courier.id" class="text-indigo-600 animate-fadeInUp">
                    <fa-icon [icon]="faCheckCircle" class="text-xl"></fa-icon>
                  </div>
                </div>
              </div>

              <div class="mt-10 flex gap-4 pt-8 border-t border-slate-100">
                <button (click)="closeAssignModal()" 
                        [disabled]="isAssigning"
                        class="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all">
                  Conserver
                </button>
                <button (click)="assignDelivery()" 
                        [disabled]="!selectedCourierId || isAssigning"
                        class="flex-[2] btn-primary !py-4 shadow-lg shadow-indigo-100">
                  <span *ngIf="!isAssigning" class="flex items-center justify-center gap-2">
                    Lancer la livraison <fa-icon [icon]="faTruck"></fa-icon>
                  </span>
                  <span *ngIf="isAssigning" class="flex items-center justify-center gap-3">
                    <fa-icon [icon]="faSpinner" animation="spin"></fa-icon> Flux Logistique...
                  </span>
                </button>
              </div>
            </div>
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
  faHistory = faHistory;
  faFileInvoice = faFileInvoice;
  faCalendarAlt = faCalendarAlt;
  faChevronRight = faChevronRight;
  faUser = faUser;
  faMapMarkerAlt = faMapMarkerAlt;
  faChevronDown = faChevronDown;
  faPrescription = faPrescription;
  faCapsules = faCapsules;
  faTimes = faTimes;

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
