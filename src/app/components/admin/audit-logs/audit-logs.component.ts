import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

interface AuditLog {
    id: string;
    userId: string;
    username: string;
    action: string;
    entityType: string;
    entityId: string;
    details: string;
    ipAddress: string;
    timestamp: string;
    pharmacyId: string;
    status: string;
}

interface PageResponse {
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Component({
    selector: 'app-audit-logs',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-3xl font-bold text-gray-900">Logs d'Audit</h1>
          <p class="mt-2 text-sm text-gray-700">Historique complet des actions critiques</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Action</label>
          <select [(ngModel)]="filterAction" (change)="loadLogs()" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="">Toutes</option>
            <option value="UPDATE_ORDER_STATUS">Changement statut commande</option>
            <option value="ASSIGN_DELIVERY">Assignation livraison</option>
            <option value="UPDATE_INVENTORY">Modification stock</option>
          </select>
        </div>
      </div>

      <!-- Logs Table -->
      <div class="mt-8 flex flex-col">
        <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div *ngIf="isLoading" class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>

            <div *ngIf="!isLoading" class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table class="min-w-full divide-y divide-gray-300 bg-white">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Date/Heure</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Utilisateur</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Détails</th>
                    <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">IP</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr *ngFor="let log of logs">
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                      {{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ log.username }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm">
                      <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
                            [ngClass]="getActionClass(log.action)">
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{{ log.details }}</td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ log.ipAddress }}</td>
                  </tr>
                  <tr *ngIf="logs.length === 0">
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      Aucun log trouvé
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div *ngIf="totalPages > 1" class="mt-4 flex justify-center gap-2">
              <button *ngFor="let page of [].constructor(totalPages); let i = index"
                      (click)="goToPage(i)"
                      [class.bg-indigo-600]="currentPage === i"
                      [class.text-white]="currentPage === i"
                      class="px-3 py-1 rounded border">
                {{ i + 1 }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuditLogsComponent implements OnInit {
    logs: AuditLog[] = [];
    isLoading = false;
    filterAction = '';
    currentPage = 0;
    totalPages = 0;
    pageSize = 20;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(): void {
        this.isLoading = true;
        const pharmacyId = this.authService.getUserPharmacyId();
        const isSuperAdmin = this.authService.isSuperAdmin();

        let url = '';
        if (this.filterAction) {
            url = `/api/v1/audit/action/${this.filterAction}?page=${this.currentPage}&size=${this.pageSize}`;
        } else if (isSuperAdmin) {
            url = `/api/v1/audit/all?page=${this.currentPage}&size=${this.pageSize}`;
        } else if (pharmacyId) {
            url = `/api/v1/audit/pharmacy/${pharmacyId}?page=${this.currentPage}&size=${this.pageSize}`;
        } else {
            this.isLoading = false;
            return;
        }

        this.http.get<any>(url).subscribe({
            next: (response) => {
                const pageData: PageResponse = response.data;
                this.logs = pageData.content;
                this.totalPages = pageData.totalPages;
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }

    goToPage(page: number): void {
        this.currentPage = page;
        this.loadLogs();
    }

    getActionClass(action: string): string {
        const classes: Record<string, string> = {
            'UPDATE_ORDER_STATUS': 'bg-blue-100 text-blue-800',
            'ASSIGN_DELIVERY': 'bg-green-100 text-green-800',
            'UPDATE_INVENTORY': 'bg-yellow-100 text-yellow-800',
            'DELETE_MEDICATION': 'bg-red-100 text-red-800'
        };
        return classes[action] || 'bg-gray-100 text-gray-800';
    }
}
