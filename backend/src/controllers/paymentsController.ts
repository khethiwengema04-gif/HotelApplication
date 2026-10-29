import { Request, Response } from 'express';
import {
    initialisePayment,
    verifyPayment
} from '../service/paymentsService';

// Initialise payment for a booking
export const initialisePaymentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const bookingId = Number(req.body.bookingId);

        // Get the logged-in user from authMiddleware
        const user = (req as any).user;

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            res.status(400).json({
                message: 'A valid booking ID is required'
            });
            return;
        }

        if (!user?.id || !user?.email) {
            res.status(401).json({
                message: 'User authentication required'
            });
            return;
        }

        const payment = await initialisePayment(
            bookingId,
            Number(user.id),
            user.email
        );

        res.status(200).json({
            message: 'Payment initialised successfully',
            ...payment
        });
    } catch (error: any) {
        console.error('Initialise payment error:', error.message);

        const statusCode =
            error.message === 'Booking not found' ? 404 :
                error.message === 'This booking cannot be paid for' ? 400 :
                    error.message === 'Invalid booking amount' ? 400 : 500;

        res.status(statusCode).json({
            message: error.message || 'Failed to initialise payment'
        });
    }
};

// Verify payment after Paystack redirects the user back
export const verifyPaymentController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const reference = String(
            req.query.reference || req.query.trxref || ''
        );

        const user = (req as any).user;

        if (!reference) {
            res.status(400).json({
                message: 'Payment reference is required'
            });
            return;
        }

        if (!user?.id) {
            res.status(401).json({
                message: 'User authentication required'
            });
            return;
        }

        const payment = await verifyPayment(
            reference,
            Number(user.id)
        );

        res.status(200).json({
            message: 'Payment verified successfully',
            payment
        });
    } catch (error: any) {
        console.error('Verify payment error:', error.message);

        res.status(400).json({
            message: error.message || 'Payment verification failed'
        });
    }
};
