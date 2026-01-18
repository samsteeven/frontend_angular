import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone?: string;
}

@Component({
    selector: 'app-employee-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './employee-management.component.html'
})
export class EmployeeManagementComponent implements OnInit {
    employees: User[] = [];
    isLoading = false;
    errorMessage: string | null = null;
    isSaving = false;

    // Add Modal State
    isAddModalOpen = false;
    addForm: FormGroup;

    // Delete Modal State
    isDeleteModalOpen = false;
    employeeToDelete: User | null = null;

    // Permission Modal State
    isPermissionModalOpen = false;
    selectedEmployee: User | null = null;
    isLoadingPermissions = false;
    employeePermissions: any = { // Mock permissions object
        canPrepareOrders: false,
        canAssignDeliveries: false,
        canViewStatistics: false,
        canManageInventory: false,
        canViewCustomerInfo: false,
        canProcessPayments: false
    };

    constructor(private fb: FormBuilder) {
        this.addForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['PHARMACY_EMPLOYEE', Validators.required],
            password: ['123456'], // Mock default
            phone: ['']
        });
    }

    ngOnInit(): void {
        // Mock Data
        this.employees = [
            { id: 1, firstName: 'Alice', lastName: 'Martin', email: 'alice@pharma.com', role: 'PHARMACY_EMPLOYEE', phone: '0600000001' },
            { id: 2, firstName: 'Bob', lastName: 'Durand', email: 'bob@delivery.com', role: 'DELIVERY', phone: '0600000002' }
        ];
    }

    // Add Modal
    openAddModal(): void {
        this.isAddModalOpen = true;
    }

    closeAddModal(): void {
        this.isAddModalOpen = false;
        this.addForm.reset({ role: 'PHARMACY_EMPLOYEE' });
    }

    onAddEmployee(): void {
        if (this.addForm.valid) {
            const newEmployee = {
                id: this.employees.length + 1,
                ...this.addForm.value
            };
            this.employees.push(newEmployee);
            this.closeAddModal();
            alert('Employé ajouté (Simulation)');
        }
    }

    // Delete Modal
    confirmDelete(employee: User): void {
        this.employeeToDelete = employee;
        this.isDeleteModalOpen = true;
    }

    cancelDelete(): void {
        this.isDeleteModalOpen = false;
        this.employeeToDelete = null;
    }

    performDelete(): void {
        if (this.employeeToDelete) {
            this.employees = this.employees.filter(e => e.id !== this.employeeToDelete!.id);
            this.cancelDelete();
            alert('Employé supprimé (Simulation)');
        }
    }

    // Permissions Modal
    openPermissionModal(employee: User): void {
        this.selectedEmployee = employee;
        this.isPermissionModalOpen = true;
        // Reset mock permissions
        this.employeePermissions = {
            canPrepareOrders: true,
            canAssignDeliveries: false,
            canViewStatistics: false,
            canManageInventory: true,
            canViewCustomerInfo: false,
            canProcessPayments: false
        };
    }

    closePermissionModal(): void {
        this.isPermissionModalOpen = false;
        this.selectedEmployee = null;
    }

    savePermissions(): void {
        this.closePermissionModal();
        alert('Permissions sauvegardées (Simulation)');
    }
}
