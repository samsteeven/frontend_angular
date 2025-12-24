export type PharmacyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Pharmacy {
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    phone: string;
    email?: string;
    isOpen?: boolean;
    status: PharmacyStatus;
    licenseNumber?: string;
    licenseDocumentUrl?: string;
    ownerName?: string;
    ownerId?: string;
    createdAt?: Date;
}

export interface PharmacyMedicationDTO {
    medicationId: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
}
