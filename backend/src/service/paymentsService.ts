
import axios from 'axios';
import { randomUUID } from 'crypto';
import { query } from '../config/database';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL =
    process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co';

if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is missing from .env');
}

const paystack = axios.create({
    baseURL: PAYSTACK_BASE_URL,
    headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
});

// Initialise payment using the existing booking
export const initialisePayment = async (
    bookingId: number,
    userId: number,
    userEmail: string
) => {
    const bookingResult = await query(
        `SELECT id, user_id, total_price, status
         FROM bookings
         WHERE id = $1 AND user_id = $2`,
        [bookingId, userId]
    );

    if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
    }

    const booking = bookingResult.rows[0];

    if (['Rejected', 'Cancelled'].includes(booking.status)) {
        throw new Error('This booking cannot be paid for');
    }

    const amountInCents = Math.round(
        Number(booking.total_price) * 100
    );

    if (!Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
        throw new Error('Invalid booking amount');
    }

    const reference = `nestova-${randomUUID()}`;

    const response = await paystack.post(
        '/transaction/initialize',
        {
            email: userEmail,
            amount: amountInCents,
            currency: 'ZAR',
            reference,
            callback_url:
                `${process.env.FRONTEND_URL}/payment/callback`,
            metadata: {
                booking_id: booking.id,
                user_id: userId
            }
        }
    );

    if (!response.data.status) {
        throw new Error('Could not initialise Paystack payment');
    }

    await query(
        `INSERT INTO payments
            (booking_id, user_id, payment_reference,
             amount, currency, payment_method, status)
         VALUES ($1, $2, $3, $4, 'ZAR', 'Paystack', 'Pending')`,
        [booking.id, userId, reference, booking.total_price]
    );

    console.log('Payment initialised. Reference:', reference);
    console.log('Booking ID:', booking.id);
    console.log('Expected amount in cents:', amountInCents);

    return {
        reference,
        authorization_url: response.data.data.authorization_url
    };
};

// Verify payment with Paystack
export const verifyPayment = async (
    reference: string,
    userId: number
) => {
    console.log('--- PAYMENT VERIFICATION STARTED ---');
    console.log('Verifying payment reference:', reference);
    console.log('User ID:', userId);

    const paymentResult = await query(
        `SELECT id, booking_id, user_id, amount, currency, status
         FROM payments
         WHERE payment_reference = $1
           AND user_id = $2`,
        [reference, userId]
    );

    if (paymentResult.rows.length === 0) {
        console.error(
            'Payment record not found for reference:',
            reference
        );
        throw new Error('Payment record not found');
    }

    const payment = paymentResult.rows[0];

    console.log('Database payment ID:', payment.id);
    console.log('Database payment status:', payment.status);
    console.log('Database amount:', payment.amount);
    console.log('Database currency:', payment.currency);

    if (payment.status === 'Successful') {
        console.log('Payment is already marked Successful.');
        return payment;
    }

    let response;

    try {
        response = await paystack.get(
            `/transaction/verify/${encodeURIComponent(reference)}`
        );
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error(
                'Paystack verification request failed:',
                error.response?.status,
                error.response?.data?.message || error.message
            );
        } else {
            console.error('Unexpected Paystack verification error:', error);
        }

        throw new Error('Could not contact Paystack to verify payment');
    }

    const transaction = response.data.data;

    const expectedAmount = Math.round(
        Number(payment.amount) * 100
    );

    console.log('Paystack API response status:', response.data.status);
    console.log('Paystack transaction status:', transaction?.status);
    console.log('Paystack transaction reference:', transaction?.reference);
    console.log('Expected amount in cents:', expectedAmount);
    console.log('Paystack amount in cents:', transaction?.amount);
    console.log('Paystack currency:', transaction?.currency);

    if (
        !response.data.status ||
        transaction?.status !== 'success' ||
        transaction?.reference !== reference ||
        transaction?.currency !== 'ZAR' ||
        Number(transaction?.amount) !== expectedAmount
    ) {
        console.error(
            'Payment verification failed: Paystack details did not match.'
        );
        throw new Error('Payment could not be verified');
    }

    const updateResult = await query(
        `UPDATE payments
         SET status = 'Successful',
             paid_at = CURRENT_TIMESTAMP
         WHERE payment_reference = $1
           AND user_id = $2
           AND status = 'Pending'
         RETURNING *`,
        [reference, userId]
    );

    console.log('Database update rows:', updateResult.rows.length);

    if (updateResult.rows.length === 0) {
        // Check whether another request already updated the payment.
        const latestResult = await query(
            `SELECT id, booking_id, payment_reference, status, paid_at
             FROM payments
             WHERE payment_reference = $1
               AND user_id = $2`,
            [reference, userId]
        );

        const latestPayment = latestResult.rows[0];

        if (latestPayment?.status === 'Successful') {
            console.log('Payment was already updated successfully.');
            return latestPayment;
        }

        console.error(
            'Payment status could not be updated:',
            latestPayment
        );

        throw new Error('Payment status could not be updated');
    }

    console.log(
        'Payment successfully updated in PostgreSQL:',
        updateResult.rows[0].id
    );
    console.log('--- PAYMENT VERIFICATION COMPLETED ---');

    return updateResult.rows[0];
};
