import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, PaginatedResponse } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;

  // Edit Modal State
  isEditModalOpen = false;
  editingUser: User | null = null;
  editForm: FormGroup;

  // Delete Modal State
  userToDelete: User | null = null;
  isDeleteModalOpen = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      city: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(page: number = 0): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.getAllUsers(page, this.pageSize).subscribe({
      next: (response: PaginatedResponse<User>) => {
        // Support both paginated and list response for safety
        if (response.content) {
          this.users = response.content;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.currentPage = response.number;
        } else if (Array.isArray(response)) {
          // Fallback if backend returns array
          this.users = response;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users', err);
        this.errorMessage = "Impossible de charger la liste des utilisateurs.";
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadUsers(page);
    }
  }

  // Open Edit Modal
  editUser(user: User): void {
    this.editingUser = user;
    this.editForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city
    });
    this.isEditModalOpen = true;
  }

  // Close Edit Modal
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingUser = null;
    this.editForm.reset();
  }

  // Submit Edit Form
  onUpdateUser(): void {
    if (this.editForm.valid && this.editingUser) {
      this.isSaving = true;
      const updateData = { ...this.editingUser, ...this.editForm.value };

      this.userService.updateUser(this.editingUser.id, updateData).subscribe({
        next: (updatedUser) => {
          // Update local list
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.isSaving = false;
          this.closeEditModal();
        },
        error: (err) => {
          console.error('Error updating user', err);
          this.isSaving = false;
          alert('Erreur lors de la mise à jour de l\'utilisateur.');
        }
      });
    }
  }

  confirmDelete(user: User): void {
    this.userToDelete = user;
    this.isDeleteModalOpen = true;
  }

  cancelDelete(): void {
    this.userToDelete = null;
    this.isDeleteModalOpen = false;
  }

  performDelete(): void {
    if (this.userToDelete) {
      this.isSaving = true;
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.loadUsers(this.currentPage);
          this.isSaving = false;
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting user', err);
          this.isSaving = false;
          alert("Erreur lors de la suppression de l'utilisateur.");
          this.cancelDelete();
        }
      });
    }
  }
}
