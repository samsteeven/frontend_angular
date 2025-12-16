// ==========================================
// user.model.ts
// ==========================================
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string; // Allow string for compatibility or strict it later
  phone?: string;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  avatar?: string;
  isActive: boolean;
  createdAt?: Date | string; // Allow string for API response compatibility
  updatedAt?: Date | string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  COLLECTEUR = 'COLLECTEUR'
}

// ==========================================
// auth.model.ts
// ==========================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// ==========================================
// profile.model.ts
// ==========================================
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// ==========================================
// collecteur.model.ts
// ==========================================
export interface Collecteur extends User {
  zone: string;
  numeroMatricule: string;
  dateEmbauche: Date;
  statut: 'actif' | 'inactif' | 'suspendu';
  nombreCollectes: number;
  tauxReussite: number;
}

// ==========================================
// client.model.ts
// ==========================================
export interface Client extends User {
  adresse?: string;
  ville?: string;
  codePostal?: string;
  nombreRecus: number;
  montantTotal: number;
}

// ==========================================
// recu.model.ts
// ==========================================
export interface Recu {
  id: string;
  numero: string;
  clientId: string;
  collecteurId?: string;
  montant: number;
  dateEmission: Date;
  dateCollecte?: Date;
  statut: 'en_attente' | 'en_cours' | 'collecte' | 'refuse';
  motifRefus?: string;
  observations?: string;
  documents?: string[];
}

// ==========================================
// transaction.model.ts
// ==========================================
export interface Transaction {
  id: string;
  recuId: string;
  clientId: string;
  collecteurId?: string;
  montant: number;
  type: 'collecte' | 'remboursement';
  statut: 'en_attente' | 'validee' | 'annulee';
  dateTransaction: Date;
  reference: string;
}

// ==========================================
// notification.model.ts
// ==========================================
export interface Notification {
  id: string;
  userId: string;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  dateCreation: Date;
  link?: string;
}

// ==========================================
// stats.model.ts
// ==========================================
export interface DashboardStats {
  totalUsers?: number;
  totalClients?: number;
  totalCollecteurs?: number;
  totalRecus?: number;
  recusEnAttente?: number;
  recusCollectes?: number;
  montantTotal?: number;
  montantMoisActuel?: number;
  tauxCollecte?: number;
  // Répartition des utilisateurs par rôle, ex: { ADMIN: 3, CLIENT: 42 }
  roles?: { [role: string]: number };
}

export interface ClientStats {
  totalRecus: number;
  recusEnAttente: number;
  recusCollectes: number;
  montantTotal: number;
  dernierRecu?: Recu;
}

export interface CollecteurStats {
  totalCollectes: number;
  collectesMoisActuel: number;
  montantCollecte: number;
  tauxReussite: number;
  prochainePaie?: Date;
}
