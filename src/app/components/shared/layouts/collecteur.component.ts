import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-collecteur-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-gray-800">Collecteur</h1>
            </div>
            <div class="flex items-center space-x-4">
              <a 
                routerLink="/collecteur/dashboard" 
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Dashboard
              </a>
              <a 
                routerLink="/collecteur/profile" 
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="text-gray-700 hover:text-blue-600 px-3 py-2"
              >
                Profil
              </a>
              <button 
                (click)="logout()"
                class="text-gray-700 hover:text-red-600 px-3 py-2"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Contenu principal -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <router-outlet></router-outlet> <!-- IMPORTANT : router-outlet ici -->
      </main>
    </div>
  `
})
export class CollecteurLayoutComponent {
  constructor(private authService: AuthService) {}
  
  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}