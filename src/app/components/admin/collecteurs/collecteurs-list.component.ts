import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { RouterLink } from '@angular/router';
import { Collecteur } from '../../../models/user.model';

@Component({
  selector: 'app-collecteurs-list',
  standalone: true,
  imports: [CommonModule, /*RouterLink*/],
  template: `
    <h2>Collecteurs</h2>
    <p *ngIf="loading">Chargement...</p>
    <ul>
      <li *ngFor="let c of collecteurs">{{ c.firstName }} {{ c.lastName }}</li>
    </ul>
  `
})
export class CollecteursListComponent implements OnInit {
  collecteurs: Collecteur[] = [];
  loading = false;

  constructor() { }

  ngOnInit(): void {
    // TODO: récupérer la liste via un service
  }
}