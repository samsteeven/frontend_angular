import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-collecteur-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collecteur-dashboard.component.html',
  styleUrls: ['./collecteur-dashboard.component.css']
})
export class CollecteurDashboardComponent implements OnInit {
  
  stats = {
    totalCollectes: 0,
    collectesMoisActuel: 0,
    montantCollecte: 0,
    tauxReussite: 0,
    prochainePaie: new Date()
  };

  recentCollectes = [
    { id: '001', client: 'Jean Dupont', montant: 15000, date: '2024-01-15', statut: 'collecté' },
    { id: '002', client: 'Marie Martin', montant: 23000, date: '2024-01-14', statut: 'en attente' },
    { id: '003', client: 'Pierre Durand', montant: 18000, date: '2024-01-13', statut: 'collecté' }
  ];

  constructor() {}

  ngOnInit(): void {
    // Simulation de données
    this.stats = {
      totalCollectes: 42,
      collectesMoisActuel: 15,
      montantCollecte: 325000,
      tauxReussite: 85,
      prochainePaie: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  getBadgeClass(statut: string): string {
    switch(statut) {
      case 'collecté': return 'bg-green-100 text-green-800';
      case 'en attente': return 'bg-yellow-100 text-yellow-800';
      case 'annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}