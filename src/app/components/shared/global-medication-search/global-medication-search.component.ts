import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MedicationCatalogService, PatientMedicationSearchResult } from '@services/medication-catalog.service';

@Component({
    selector: 'app-global-medication-search',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './global-medication-search.component.html'
})
export class GlobalMedicationSearchComponent implements OnInit {
    // Search Params
    searchQuery: string = '';
    selectedClass: string = '';
    sortBy: string = 'PRICE'; // PRICE, RATING

    // State
    loading: boolean = false;
    results: PatientMedicationSearchResult[] = [];
    hasSearched: boolean = false;

    therapeuticClasses = [
        'ANTALGIQUE',
        'ANTIBIOTIQUE',
        'ANTIHISTAMINIQUE',
        'ANTIHYPERTENSEUR',
        'ANTIPYRETIQUE',
        'ANTIINFLAMMATOIRE'
    ];

    constructor(private catalogService: MedicationCatalogService) { }

    ngOnInit(): void {
        this.onSearch();
    }

    onSearch(): void {
        this.loading = true;
        this.hasSearched = true;

        const params = {
            query: this.searchQuery,
            therapeuticClass: this.selectedClass || undefined,
            sortBy: this.sortBy,
            userLat: 0,
            userLon: 0
        };

        console.log('Searching global with:', params);

        this.catalogService.searchGlobal(params).subscribe({
            next: (data) => {
                this.results = data;
                console.log('Results:', this.results);
                this.loading = false;
            },
            error: (err) => {
                console.error('Search error:', err);
                this.loading = false;
                // Could show toast/alert here
            }
        });
    }

    onSortChange(): void {
        if (this.hasSearched) {
            this.onSearch();
        }
    }
}
