
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Payment {
    id?: number;
    booking_id?: number;
    payment_reference?: string;
    amount?: number | string;
    status?: 'Pending' | 'Successful' | 'Failed';
}

interface PaymentState {
    payment: Payment | null;
    authorizationUrl: string | null;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

interface InitialisePaymentResponse {
    message: string;
    reference: string;
    authorization_url: string;
}

interface VerifyPaymentResponse {
    message: string;
    payment: Payment;
}

const API_URL = 'http://localhost:5000/api/payments';

const getToken = (): string | null => {
    return localStorage.getItem('token');
};

// Initialise payment (thunk)
export const initialisePaymentThunk = createAsyncThunk<
    InitialisePaymentResponse,
    number,
    { rejectValue: string }
>(
    'payment/initialise',
    async (bookingId, { rejectWithValue }) => {
        try {
            const token = getToken();

            if (!token) {
                return rejectWithValue('Please log in to make a payment.');
            }

            const response = await axios.post<InitialisePaymentResponse>(
                `${API_URL}/initialise`,
                { bookingId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return response.data;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    'Failed to initialise payment.'
                );
            }

            return rejectWithValue('An unexpected error occurred.');
        }
    }
);

// Verify payment
export const verifyPaymentThunk = createAsyncThunk<
    Payment,
    string,
    { rejectValue: string }
>(
    'payment/verify',
    async (reference, { rejectWithValue }) => {
        try {
            const token = getToken();

            if (!token) {
                return rejectWithValue('Please log in to verify payment.');
            }

            const response = await axios.get<VerifyPaymentResponse>(
                `${API_URL}/verify`,
                {
                    params: { reference },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            return response.data.payment;
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    'Payment verification failed.'
                );
            }

            return rejectWithValue('An unexpected error occurred.');
        }
    }
);

const initialState: PaymentState = {
    payment: null,
    authorizationUrl: null,
    loading: false,
    error: null,
    successMessage: null
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearPaymentState: (state) => {
            state.payment = null;
            state.authorizationUrl = null;
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initialisePaymentThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(initialisePaymentThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.authorizationUrl = action.payload.authorization_url;
                state.successMessage = action.payload.message;
            })
            .addCase(initialisePaymentThunk.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload || 'Failed to initialise payment.';
            })
            .addCase(verifyPaymentThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(verifyPaymentThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.payment = action.payload;
                state.successMessage = 'Payment verified successfully.';
            })
            .addCase(verifyPaymentThunk.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.payload || 'Payment verification failed.';
            });
    }
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
