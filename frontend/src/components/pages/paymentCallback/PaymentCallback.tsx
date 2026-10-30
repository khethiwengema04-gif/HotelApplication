import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../store'
import { verifyPaymentThunk } from '../../../features/payment'

const PaymentCallback = () => {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const [message, setMessage] = useState('Verifying your payment...')
    const [success, setSuccess] = useState(false)
    const [checking, setChecking] = useState(true)

    const hasVerified = useRef(false)

    useEffect(() => {
        if (hasVerified.current) return
        hasVerified.current = true

        const reference =
            searchParams.get('reference') ||
            searchParams.get('trxref')

        if (!reference) {
            setMessage('No payment reference was found.')
            setChecking(false)
            return
        }

        const verifyPayment = async () => {
            const result = await dispatch(verifyPaymentThunk(reference))

            if (verifyPaymentThunk.fulfilled.match(result)) {
                setMessage(
                    'Payment successful! Your booking is awaiting administrator approval.'
                )
                setSuccess(true)
            } else {
                setMessage(
                    typeof result.payload === 'string'
                        ? result.payload
                        : 'We could not verify your payment. Please check My Bookings before trying again.'
                )
            }

            setChecking(false)
        }

        void verifyPayment()
    }, [dispatch, searchParams])

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f5f7fa'
        }}>
            <section style={{
                maxWidth: '520px',
                width: '100%',
                padding: '36px',
                background: '#ffffff',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 8px 28px rgba(0,0,0,0.08)'
            }}>
                <h1>
                    {checking
                        ? 'Verifying payment'
                        : success
                            ? 'Payment successful'
                            : 'Payment verification'}
                </h1>

                <p role="status">{message}</p>

                {!checking && (
                    <button
                        type="button"
                        onClick={() => navigate('/my-bookings')}
                        style={{
                            marginTop: '20px',
                            padding: '12px 20px',
                            border: 'none',
                            borderRadius: '8px',
                            background: '#142b4a',
                            color: '#ffffff',
                            cursor: 'pointer'
                        }}
                    >
                        View My Bookings
                    </button>
                )}
            </section>
        </main>
    )
}

export default PaymentCallback
