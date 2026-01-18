import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Medication {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
}

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-management.html',
  styleUrl: './stock-management.css'
})
export class StockManagementComponent implements OnInit {

  medications: Medication[] = [];
  searchTerm: string = '';

  constructor() { }

  ngOnInit(): void {
    // Mock Data
    this.medications = [
      { id: 1, name: 'Doliprane 1000mg', price: 2.50, stock: 150, category: 'Antalgique' },
      { id: 2, name: 'Spasfon', price: 3.90, stock: 45, category: 'Antispasmodique' },
      { id: 3, name: 'Amoxicilline', price: 5.20, stock: 8, category: 'Antibiotique' }, // Low stock
      { id: 4, name: 'Fervex', price: 6.50, stock: 200, category: 'Rhume' },
      { id: 5, name: 'Efferalgan', price: 2.10, stock: 0, category: 'Antalgique' } // Out of stock
    ];
  }

  get filteredMedications(): Medication[] {
    return this.medications.filter(med =>
      med.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      med.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  editMedication(med: Medication): void {
    console.log('Edit', med);
    // TODO: Open Modal
  }

  deleteMedication(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce médicament ?')) {
      this.medications = this.medications.filter(m => m.id !== id);
    }
  }

  openAddModal(): void {
    console.log('Open Add Modal');
    // TODO: Open Modal
  }
}
