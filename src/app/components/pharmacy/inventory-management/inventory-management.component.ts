import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService, Medication } from '../../../services/inventory.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-xl font-semibold text-gray-900">Gestion de l'Inventaire</h1>
          <p class="mt-2 text-sm text-gray-700">Liste des médicaments disponibles dans votre pharmacie, gestion du stock et des prix.</p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-3">
          <a routerLink="/pharmacy-admin/catalog"
             class="inline-flex items-center justify-center rounded-md border border-green-600 bg-white px-4 py-2 text-sm font-medium text-green-600 shadow-sm hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto">
            <i class="fas fa-book-medical mr-2"></i> Parcourir le catalogue
          </a>
          <button type="button" (click)="openModal()"
                  class="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto">
            <i class="fas fa-edit mr-2"></i> Modifier stock/prix
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="mt-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <input type="text" [(ngModel)]="searchTerm" (input)="onSearch()"
                   class="block w-full rounded-md border-gray-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm"
                   placeholder="Rechercher par nom, fabricant...">
          </div>
        </div>
      </div>

      <!-- Alert Success/Error -->
      <div *ngIf="notification" [ngClass]="{'bg-green-50 text-green-800': notification.type === 'success', 'bg-red-50 text-red-800': notification.type === 'error'}" class="rounded-md p-4 mt-4">
        <div class="flex">
            <div class="flex-shrink-0">
                <i [ngClass]="{'fa-check-circle': notification.type === 'success', 'fa-exclamation-circle': notification.type === 'error'}" class="fas"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">{{ notification.message }}</p>
            </div>
        </div>
      </div>

      <!-- Table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Médicament</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Catégorie</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Prix</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiration</th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr *ngFor="let med of medications">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div class="flex items-center">
                        <div class="h-10 w-10 flex-shrink-0">
                          <img class="h-10 w-10 rounded-full object-cover bg-gray-100" [src]="med.imageUrl || 'assets/default-med.png'" alt="">
                        </div>
                        <div class="ml-4">
                          <div class="font-medium text-gray-900">{{ med.name }}</div>
                          <div class="text-gray-500">{{ med.manufacturer }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ med.category || 'N/A' }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ med.price | currency:'XAF':'symbol':'1.0-0' }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span [ngClass]="{'bg-green-100 text-green-800': med.stock > 10, 'bg-yellow-100 text-yellow-800': med.stock <= 10 && med.stock > 0, 'bg-red-100 text-red-800': med.stock === 0}"
                            class="inline-flex rounded-full px-2 text-xs font-semibold leading-5">
                        {{ med.stock }}
                      </span>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ med.expiryDate | date:'shortDate' }}</td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button (click)="editMedication(med)" class="text-green-600 hover:text-green-900 mr-4"><i class="fas fa-edit"></i></button>
                      <button (click)="deleteMedication(med)" class="text-red-600 hover:text-red-900"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                  <tr *ngIf="medications.length === 0 && !isLoading">
                      <td colspan="6" class="text-center py-4 text-gray-500">Aucun médicament trouvé.</td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Loading State -->
              <div *ngIf="isLoading" class="text-center py-4">
                   <i class="fas fa-spinner fa-spin text-2xl text-green-600"></i>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal (Premium Design) -->
      <div *ngIf="showModal" class="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" (click)="closeModal()"></div>

        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <div class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all border border-gray-100">
            
            <div class="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
              <h3 class="text-xl font-semibold leading-6 text-gray-900">{{ isEditing ? 'Modifier' : 'Ajouter un médicament' }}</h3>
              <button type="button" (click)="closeModal()" class="text-gray-400 hover:text-gray-500 transition-colors">
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>

            <div class="px-6 py-6">
              <form [formGroup]="inventoryForm" (ngSubmit)="onSubmit()" class="space-y-5">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom du médicament</label>
                  <input type="text" formControlName="name"
                    class="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-green-500 sm:text-sm transition-colors"
                    placeholder="Paracétamol 500mg">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fabricant</label>
                  <input type="text" formControlName="manufacturer"
                    class="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-green-500 sm:text-sm transition-colors"
                    placeholder="Laboratoire XYZ">
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prix (XAF)</label>
                    <input type="number" formControlName="price"
                      class="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-green-500 sm:text-sm transition-colors"
                      placeholder="2500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input type="number" formControlName="stock"
                      class="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-green-500 sm:text-sm transition-colors"
                      placeholder="100">
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea formControlName="description" rows="3"
                    class="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-green-500 sm:text-sm transition-colors"
                    placeholder="Description du médicament..."></textarea>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                  <input type="date" formControlName="expiryDate"
                    class="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 focus:bg-white focus:border-green-500 focus:ring-green-500 sm:text-sm transition-colors">
                </div>

                <div class="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                  <button type="button" (click)="closeModal()"
                    class="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" [disabled]="inventoryForm.invalid || isSaving"
                    class="inline-flex justify-center rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 transition-colors disabled:opacity-50">
                    {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class InventoryManagementComponent implements OnInit {
  medications: Medication[] = [];
  isLoading = false;
  searchTerm = '';
  pharmacyId: string = '';

  showModal = false;
  isEditing = false;
  isSaving = false;
  selectedMedication: Medication | null = null;
  inventoryForm: FormGroup;
  notification: { type: 'success' | 'error', message: string } | null = null;

  constructor(
    private inventoryService: InventoryService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.inventoryForm = this.fb.group({
      name: ['', Validators.required],
      manufacturer: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      expiryDate: ['', Validators.required],
      category: ['']
    });
  }

  ngOnInit(): void {
    // Get pharmacyId from current user
    const pharmacyId = this.authService.getUserPharmacyId();
    if (!pharmacyId) {
      this.showNotification('error', 'Aucune pharmacie associée à votre compte');
      return;
    }
    this.pharmacyId = pharmacyId;
    this.loadInventory();
  }

  loadInventory(): void {
    if (!this.pharmacyId) return;

    this.isLoading = true;
    this.inventoryService.getInventory(this.pharmacyId).subscribe({
      next: (medications) => {
        this.medications = medications;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading inventory', err);
        this.isLoading = false;
        this.showNotification('error', 'Erreur lors du chargement de l\'inventaire');
      }
    });
  }

  onSearch(): void {
    this.loadInventory();
  }

  openModal(): void {
    this.isEditing = false;
    this.selectedMedication = null;
    this.inventoryForm.reset({ price: 0, stock: 0 });
    this.showModal = true;
  }

  editMedication(med: Medication): void {
    this.isEditing = true;
    this.selectedMedication = med;
    this.inventoryForm.patchValue({
      name: med.name,
      manufacturer: med.manufacturer,
      description: med.description,
      price: med.price,
      stock: med.stock,
      expiryDate: med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : '',
      category: med.category
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.notification = null;
  }

  onSubmit(): void {
    if (this.inventoryForm.valid) {
      this.isSaving = true;
      const formValue = this.inventoryForm.value;

      if (this.isEditing && this.selectedMedication) {
        this.inventoryService.updateMedication(this.pharmacyId, this.selectedMedication.id, formValue).subscribe({
          next: (updatedMed) => {
            this.isSaving = false;
            this.showModal = false;
            this.loadInventory();
            this.showNotification('success', 'Médicament mis à jour avec succès');
          },
          error: (err) => {
            this.isSaving = false;
            this.showNotification('error', 'Erreur lors de la mise à jour');
          }
        });
      } else {
        // For adding new medication, redirect to catalog
        this.showNotification('error', 'Veuillez utiliser le catalogue pour ajouter un médicament');
        this.isSaving = false;
        this.showModal = false;
      }
    }
  }

  deleteMedication(med: Medication): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${med.name} ?`)) {
      this.inventoryService.deleteMedication(this.pharmacyId, med.id).subscribe({
        next: () => {
          this.loadInventory();
          this.showNotification('success', 'Médicament supprimé');
        },
        error: (err) => {
          this.showNotification('error', 'Impossible de supprimer ce médicament');
        }
      });
    }
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification = { type, message };
    setTimeout(() => this.notification = null, 3000);
  }
}
