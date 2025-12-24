export enum PaymentMethod {
    CARD = 'CARD',
    MOBILE_MONEY = 'MOBILE_MONEY',
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY'
}

export interface PaymentRequestDTO {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    phoneNumber?: string; // For Mobile Money
}

export interface PaymentReceipt {
    transactionId: string;
    date: Date;
    amount: number;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    url?: string;
}
