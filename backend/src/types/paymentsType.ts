export type PaymentStatus =
    | 'Pending'
    | 'Successful'
    | 'Failed';

export type PaymentMethod = 'Paystack';

export interface Payment {
    id: number;
    booking_id: number;
    user_id: number;
    payment_reference: string;
    amount: number;
    currency: string;
    payment_method: PaymentMethod;
    status: PaymentStatus;
    paid_at: Date | null;
    created_at: Date;
}

export interface CreatePaymentInput {
    booking_id: number;
    user_id: number;
    payment_reference: string;
    amount: number;
    currency?: string;
}
