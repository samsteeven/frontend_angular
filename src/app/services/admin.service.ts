import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { PharmacyService } from './pharmacy.service';

@Injectable({ providedIn: 'root' })
export class AdminService {

    constructor(
        private userService: UserService,
        private pharmacyService: PharmacyService,
        private http: HttpClient
    ) { }

    getDashboardStats(): Observable<any> {
        return forkJoin({
            usersData: this.userService.getAllUsers(0, 1), // Get page 0, size 1 just to read 'totalElements'
            pharmacies: this.pharmacyService.getAll()
        }).pipe(
            map(({ usersData, pharmacies }) => {
                return {
                    totalUsers: usersData.totalElements,
                    totalPharmacies: pharmacies.filter(p => p.status === 'APPROVED').length,
                    pendingPharmacies: pharmacies.filter(p => p.status === 'PENDING').length
                };
            })
        );
    }

    getPharmacyRevenue(pharmacyId: string): Observable<any> {
        return this.http.get<any>(`/api/v1/orders/pharmacy-stats/${pharmacyId}`);
    }
}
