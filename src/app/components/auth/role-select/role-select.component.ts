// app/components/auth/role-select/role-select.component.ts
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-select',
  imports: [CommonModule, RouterModule],
  templateUrl: './role-select.component.html',
  styleUrls: ['./role-select.component.css']
})

export class RoleSelectComponent {
  roles = [
    {
      id: 'admin',
      title: 'Administrateur',
      icon: 'fas fa-user-shield',
      description: 'Gestion complète de la plateforme',
      features: ['Gestion des utilisateurs', 'Tableau de bord', 'Rapports'],
      color: 'blue'
    },
    {
      id: 'collecteur',
      title: 'Collecteur',
      icon: 'fas fa-user-tie',
      description: 'Gestion des collectes et reçus',
      features: ['Validation des reçus', 'Suivi des collectes', 'Notifications'],
      color: 'green'
    },
    {
      id: 'client',
      title: 'Client',
      icon: 'fas fa-user',
      description: 'Suivi des transactions et reçus',
      features: ['Historique des transactions', 'Mes reçus', 'Alertes'],
      color: 'purple'
    }
  ];
  constructor(private router: Router) { }

  selectRole(role: string): void {
    this.router.navigate(['/register', role]);
  }
}