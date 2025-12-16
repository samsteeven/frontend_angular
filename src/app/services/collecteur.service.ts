import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';


@Injectable({ providedIn: 'root' })
export class CollecteurService {
  private apiUrl = '/api/collecteur'; // ajuste selon ton backend

  constructor(private http: HttpClient) { }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data);
  }

  logout(): void {
    // effacer token/localStorage, éventuellement appeler l'API
    localStorage.removeItem('token');
    console.log('Collecteur logout');
    window.location.href = '/login';
  }
}