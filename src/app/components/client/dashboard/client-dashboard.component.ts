import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, /*RouterLink*/],
  template: `
    <h2>Tableau de bord - Client</h2>
    <p>Contenu du dashboard client...</p>
  `
})
export class ClientDashboardComponent implements OnInit {
  ngOnInit(): void {
    // TODO: charger données client
  }
}