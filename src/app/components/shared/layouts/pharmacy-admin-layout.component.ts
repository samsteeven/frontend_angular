import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@services';
import { PharmacyService } from '../../../services/pharmacy.service';

@Component({
  selector: 'app-pharmacy-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-100">
      
      <!-- Mobile Header -->
      <div class="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-40">
        <div class="flex items-center gap-2 text-green-600">
          <i class="fas fa-prescription-bottle-alt text-2xl"></i>
          <span class="text-xl font-bold tracking-tight text-gray-900">{{ currentUser?.pharmacyName || 'Ma Pharmacie' }}</span>
        </div>
        <button (click)="toggleSidebar()" class="text-gray-500 hover:text-gray-700 focus:outline-none">
          <i class="fas" [ngClass]="isSidebarOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>
      </div>

      <!-- Sidebar Backdrop (Mobile) -->
      <div *ngIf="isSidebarOpen" (click)="toggleSidebar()" 
           class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"></div>

      <!-- Sidebar -->
      <aside [ngClass]="{'translate-x-0': isSidebarOpen, '-translate-x-full': !isSidebarOpen}"
             class="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0">
        
        <!-- Logo (Desktop) -->
        <div class="hidden md:flex h-16 items-center px-6 border-b border-gray-200">
          <div class="flex items-center gap-2 text-green-600">
            <i class="fas fa-prescription-bottle-alt text-2xl"></i>
            <span class="text-xl font-bold tracking-tight text-gray-900">{{ pharmacyName || 'Ma Pharmacie' }}</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Principal</p>
          
          <ng-container *ngIf="currentUser?.role === 'PHARMACY_ADMIN'">
            <a routerLink="/pharmacy-admin/dashboard" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
               class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
              <i class="fas fa-home w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
              Aperçu (Admin)
            </a>
            <a routerLink="/pharmacy-admin/global-search" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
               class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
              <i class="fas fa-search w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
              Recherche Globale
            </a>
          </ng-container>

          <ng-container *ngIf="currentUser?.role === 'PHARMACY_EMPLOYEE'">
            <a routerLink="/pharmacy/dashboard" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
               class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
              <i class="fas fa-home w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
              Aperçu
            </a>
          </ng-container>

          <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Gestion</p>

          <!-- ADMIN ONLY -->
          <ng-container *ngIf="currentUser?.role === 'PHARMACY_ADMIN'">
            <!-- Create Pharmacy (only if no pharmacy exists) -->
            <a *ngIf="!currentUser?.pharmacyId" routerLink="/pharmacy-admin/create-pharmacy" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
               class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
              <i class="fas fa-plus-circle w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
              Créer Pharmacie
            </a>

            <!-- Inventory (only if pharmacy exists) -->
            <a *ngIf="currentUser?.pharmacyId" routerLink="/pharmacy-admin/inventory" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
               class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
              <i class="fas fa-boxes w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
              Inventaire
            </a>

            <!-- Employees (only if pharmacy exists) -->
            <a *ngIf="currentUser?.pharmacyId" routerLink="/pharmacy-admin/employees" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
               class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
              <i class="fas fa-user-nurse w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
              Employés
            </a>
          </ng-container>

          <!-- SHARED / ADAPTED ROUTES -->
          <a [routerLink]="currentUser?.role === 'PHARMACY_ADMIN' ? '/pharmacy-admin/orders' : '/pharmacy/orders'" 
             routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
             class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
            <i class="fas fa-shopping-cart w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
            Commandes
          </a>

          <a *ngIf="currentUser?.role === 'PHARMACY_EMPLOYEE'" 
             routerLink="/pharmacy/deliveries" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
             class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
             <i class="fas fa-truck w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
             Livraisons
          </a>

          <!-- ADMIN ONLY -->
          <a *ngIf="currentUser?.role === 'PHARMACY_ADMIN'" 
             routerLink="/pharmacy-admin/settings" routerLinkActive="bg-green-50 text-green-600" (click)="closeSidebar()"
             class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-green-600 transition-colors group">
            <i class="fas fa-cog w-5 h-5 mr-3 text-gray-400 group-hover:text-green-500 group-[.text-green-600]:text-green-600 transition-colors"></i>
            Paramètres
          </a>
        </nav>

        <!-- User Profile & Logout -->
        <div class="border-t border-gray-200 p-4 bg-gray-50">
          <a routerLink="/profile" (click)="closeSidebar()" class="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm">
              {{ currentUser?.firstName?.charAt(0) }}{{ currentUser?.lastName?.charAt(0) }}
            </div>
            <div>
              <p class="font-medium text-sm text-gray-900">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</p>
              <p class="text-xs text-gray-500">{{ currentUser?.role }}</p>
            </div>
          </a>
          
          <button (click)="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
            <i class="fas fa-sign-out-alt text-gray-500"></i>
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="md:ml-64 min-h-screen p-4 md:p-8 transition-all duration-300">
        <div class="max-w-7xl mx-auto">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class PharmacyAdminLayoutComponent implements OnInit {
  isSidebarOpen = false;
  currentUser: any = null;
  pharmacyName: string = '';

  constructor(
    private authService: AuthService,
    private pharmacyService: PharmacyService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadPharmacyName();
  }

  loadPharmacyName(): void {
    const pharmacyId = this.authService.getUserPharmacyId();
    if (pharmacyId) {
      this.pharmacyService.getById(pharmacyId).subscribe({
        next: (pharmacy) => {
          this.pharmacyName = pharmacy.name;
        },
        error: (err: any) => {
          console.error('Error loading pharmacy name', err);
          this.pharmacyName = 'Ma Pharmacie';
        }
      });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}
