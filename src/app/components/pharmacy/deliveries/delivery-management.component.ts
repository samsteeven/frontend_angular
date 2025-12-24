import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { DeliveryService } from '../../../services/delivery.service';
import { Delivery, DeliveryStatus } from '../../../models/delivery.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faTruck,
    faBoxOpen,
    faCheck,
    faMapMarkerAlt,
    faClock,
    faSpinner,
    faUser,
    faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-delivery-management',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    template: `
    <div class="container mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Gestion des Livraisons</h1>
        <p class="text-gray-500">Gérez vos livraisons et assignations</p>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4 pt-2">
        <button 
          (click)="activeTab = 'AVAILABLE'"
          [class.border-blue-500]="activeTab === 'AVAILABLE'"
          [class.text-blue-600]="activeTab === 'AVAILABLE'"
          class="px-4 py-2 border-b-2 border-transparent font-medium text-sm hover:text-gray-700 transition-colors">
          Disponibles
        </button>
        <button 
          (click)="activeTab = 'MY_DELIVERIES'"
          [class.border-blue-500]="activeTab === 'MY_DELIVERIES'"
          [class.text-blue-600]="activeTab === 'MY_DELIVERIES'"
          class="px-4 py-2 border-b-2 border-transparent font-medium text-sm hover:text-gray-700 transition-colors">
          Mes Livraisons
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-20">
        <fa-icon [icon]="faSpinner" [class.fa-spin]="true" class="text-4xl text-blue-600"></fa-icon>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
        <div class="flex items-center">
          <fa-icon [icon]="faExclamationCircle" class="text-red-500 mr-2"></fa-icon>
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading">
        
        <!-- Tab 1: Available Deliveries -->
        <div *ngIf="activeTab === 'AVAILABLE'">
          <div *ngIf="availableDeliveries.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <fa-icon [icon]="faBoxOpen" class="text-2xl text-gray-400"></fa-icon>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Aucune livraison disponible</h3>
            <p class="text-gray-500 mt-1">Toutes les commandes prêtes ont été assignées.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let delivery of availableDeliveries" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Prêt à livrer
                    </span>
                    <h3 class="text-lg font-bold text-gray-900 mt-2">Commande #{{ delivery.orderId.slice(0, 8) }}</h3>
                  </div>
                  <fa-icon [icon]="faBoxOpen" class="text-gray-400 text-xl"></fa-icon>
                </div>
                
                <div class="space-y-3 text-sm text-gray-600">
                  <div class="flex items-center">
                    <fa-icon [icon]="faUser" class="w-5 text-gray-400"></fa-icon>
                    <span class="ml-2">{{ delivery.customerName || 'Client' }}</span>
                  </div>
                  <div class="flex items-center">
                    <fa-icon [icon]="faMapMarkerAlt" class="w-5 text-gray-400"></fa-icon>
                    <span class="ml-2 truncate">{{ delivery.deliveryAddress }}</span>
                  </div>
                  <div class="flex items-center">
                     <fa-icon [icon]="faClock" class="w-5 text-gray-400"></fa-icon>
                     <span class="ml-2">{{ delivery.createdAt | date:'short' }}</span>
                  </div>
                </div>

                <div class="mt-6">
                  <button (click)="acceptDelivery(delivery)" 
                          [disabled]="isActionLoading === delivery.id"
                          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2">
                    <fa-icon [icon]="isActionLoading === delivery.id ? faSpinner : faCheck" [class.fa-spin]="isActionLoading === delivery.id"></fa-icon>
                    Accepter la course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: My Deliveries -->
        <div *ngIf="activeTab === 'MY_DELIVERIES'">
          <div *ngIf="myDeliveries.length === 0" class="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <fa-icon [icon]="faTruck" class="text-2xl text-gray-400"></fa-icon>
            </div>
            <h3 class="text-lg font-medium text-gray-900">Aucune livraison en cours</h3>
            <p class="text-gray-500 mt-1">Acceptez une livraison disponible pour commencer.</p>
          </div>

          <div class="space-y-4">
            <div *ngFor="let delivery of myDeliveries" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="p-6 md:flex md:items-center md:justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center">
                    <h3 class="text-xl font-bold text-gray-900 truncate">
                      Commande #{{ delivery.orderId.slice(0, 8) }}
                    </h3>
                    <span class="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium"
                          [ngClass]="getStatusColor(delivery.status)">
                      {{ formatStatus(delivery.status) }}
                    </span>
                  </div>
                  <div class="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 text-sm text-gray-600">
                    <div class="mt-2 flex items-center">
                       <fa-icon [icon]="faUser" class="mr-1.5 text-gray-400"></fa-icon>
                       {{ delivery.customerName || 'Client' }}
                    </div>
                    <div class="mt-2 flex items-center">
                       <fa-icon [icon]="faMapMarkerAlt" class="mr-1.5 text-gray-400"></fa-icon>
                       {{ delivery.deliveryAddress }}
                    </div>
                  </div>
                </div>

                <div class="mt-5 md:mt-0 md:ml-6 flex items-center gap-3">
                   <button *ngIf="delivery.status === 'ASSIGNED'" 
                           (click)="updateStatus(delivery, 'IN_TRANSIT')"
                           [disabled]="isActionLoading === delivery.id"
                           class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                     <fa-icon [icon]="isActionLoading === delivery.id ? faSpinner : faTruck" [class.fa-spin]="isActionLoading === delivery.id" class="mr-2"></fa-icon>
                     En route
                   </button>

                   <button *ngIf="delivery.status === 'IN_TRANSIT'" 
                           (click)="updateStatus(delivery, 'DELIVERED')"
                           [disabled]="isActionLoading === delivery.id"
                           class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                     <fa-icon [icon]="isActionLoading === delivery.id ? faSpinner : faCheck" [class.fa-spin]="isActionLoading === delivery.id" class="mr-2"></fa-icon>
                     Livré
                   </button>
                   
                   <span *ngIf="delivery.status === 'DELIVERED'" class="text-green-600 font-medium flex items-center">
                      <fa-icon [icon]="faCheck" class="mr-1"></fa-icon> Terminé
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DeliveryManagementComponent implements OnInit {
    // Icons
    faTruck = faTruck;
    faBoxOpen = faBoxOpen;
    faCheck = faCheck;
    faMapMarkerAlt = faMapMarkerAlt;
    faClock = faClock;
    faSpinner = faSpinner;
    faUser = faUser;
    faExclamationCircle = faExclamationCircle;

    activeTab: 'AVAILABLE' | 'MY_DELIVERIES' = 'AVAILABLE';
    availableDeliveries: Delivery[] = [];
    myDeliveries: Delivery[] = [];

    isLoading = false;
    isActionLoading: string | null = null;
    errorMessage: string | null = null;

    constructor(
        private deliveryService: DeliveryService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.isLoading = true;
        this.errorMessage = null;

        // Load both lists
        const pharmacyId = this.authService.getUserPharmacyId();

        // In a real app we might combine these or load only active tab
        // For simplicity, we load 'my deliveries' first as it works for everyone
        this.deliveryService.getMyDeliveries().subscribe({
            next: (myRes) => {
                this.myDeliveries = myRes;

                if (pharmacyId) {
                    this.deliveryService.getAvailableDeliveries(pharmacyId).subscribe({
                        next: (availRes) => {
                            this.availableDeliveries = availRes;
                            this.isLoading = false;
                        },
                        error: (err) => {
                            console.error('Failed to load available deliveries locally', err);
                            // Might just be empty if endpoint fails differently
                            this.isLoading = false;
                        }
                    });
                } else {
                    this.isLoading = false;
                }
            },
            error: (err) => {
                console.error('Failed to load my deliveries', err);
                this.errorMessage = "Impossible de charger les livraisons.";
                this.isLoading = false;
            }
        });
    }

    acceptDelivery(delivery: Delivery): void {
        this.isActionLoading = delivery.id;
        this.deliveryService.acceptDelivery(delivery.id).subscribe({
            next: (updated) => {
                // Move from available to mine
                this.availableDeliveries = this.availableDeliveries.filter(d => d.id !== delivery.id);
                this.myDeliveries.unshift(updated);
                this.activeTab = 'MY_DELIVERIES';
                this.isActionLoading = null;
            },
            error: (err) => {
                alert("Erreur lors de l'acceptation.");
                this.isActionLoading = null;
            }
        });
    }

    updateStatus(delivery: Delivery, statusStr: string): void {
        const status = statusStr as DeliveryStatus;
        this.isActionLoading = delivery.id;
        this.deliveryService.updateStatus(delivery.id, status).subscribe({
            next: (updated) => {
                // Update local list
                const index = this.myDeliveries.findIndex(d => d.id === delivery.id);
                if (index !== -1) {
                    this.myDeliveries[index] = updated;
                }
                this.isActionLoading = null;
            },
            error: (err) => {
                alert("Erreur lors de la mise à jour.");
                this.isActionLoading = null;
            }
        });
    }

    formatStatus(status: string): string {
        switch (status) {
            case 'PENDING': return 'En attente';
            case 'ASSIGNED': return 'Assigné';
            case 'IN_TRANSIT': return 'En transit';
            case 'DELIVERED': return 'Livré';
            case 'RETURNED': return 'Retourné';
            default: return status;
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
            case 'IN_TRANSIT': return 'bg-yellow-100 text-yellow-800';
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}
