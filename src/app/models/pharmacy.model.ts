export type PharmacyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Pharmacy {
    id: string;
    userId: string;
    name: string;
    licenseNumber: string;
    address: string;
    city: string;
    phone: string;
    latitude: number;
    longitude: number;
    ownerName?: string;
    email?: string;
    description?: string;
    openingHours?: string;
    averageRating?: number;
    ratingCount?: number;
    status: PharmacyStatus;
    licenseDocumentUrl?: string;
    validatedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PharmacyMedicationDTO {
    medicationId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
}
