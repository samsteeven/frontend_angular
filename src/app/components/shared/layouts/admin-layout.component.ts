import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white">
        <div class="p-6">
          <h1 class="text-2xl font-bold mb-1">MediFind</h1>
          <p class="text-blue-200 text-sm">Administration</p>
        </div>

        <nav class="px-4 space-y-1">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-blue-700" 
             class="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-home mr-3"></i>Tableau de bord
          </a>
          <a routerLink="/admin/users" routerLinkActive="bg-blue-700" 
             class="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-users mr-3"></i>Utilisateurs
          </a>
          <a routerLink="/admin/collecteurs" routerLinkActive="bg-blue-700" 
             class="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-briefcase mr-3"></i>Collecteurs
          </a>
          <a routerLink="/admin/clients" routerLinkActive="bg-blue-700" 
             class="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-user-friends mr-3"></i>Clients
          </a>
          
          <hr class="border-blue-700 my-4">
          
          <a routerLink="/admin/profile" routerLinkActive="bg-blue-700" 
             class="flex items-center px-4 py-3 rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-user mr-3"></i>Mon profil
          </a>
          <button (click)="logout()" 
                  class="w-full flex items-center px-4 py-3 rounded-lg hover:bg-red-600 transition text-left">
            <i class="fas fa-sign-out-alt mr-3"></i>Déconnexion
          </button>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}