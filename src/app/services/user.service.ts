import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, DashboardStats } from '../models/user.model';

// Interface pour la pagination (adaptée selon Spring Data REST/Pageable habituel)
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Current page index
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/v1/users';

  constructor(private http: HttpClient) { }

  // Récupérer le profil de l'utilisateur connecté
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  // Mettre à jour le profil
  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, data);
  }

  // ADMIN: Récupérer tous les utilisateurs avec pagination
  getAllUsers(page: number = 0, size: number = 10): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  // ADMIN & USER: Récupérer un utilisateur par ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // ADMIN: Supprimer un utilisateur
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ADMIN: Changer le rôle d'un utilisateur
  changeUserRole(id: string, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role });
  }

  // USER: Supprimer son propre compte
  deleteProfile(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me`);
  }

  // ADMIN: Mettre à jour un utilisateur par ID
  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  // ADMIN: Obtenir les statistiques
  getUserStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}