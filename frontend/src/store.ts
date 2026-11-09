import { configureStore } from '@reduxjs/toolkit'
import registerReducer from './features/register'
import loginReducer from './features/login'
import hotelReducer from './features/hotels'
import paymentReducer from './features/payment'
import reviewsReducer from './features/reviews'
import profileReducer from './features/profile'
import bookingsReducer from './features/bookings'
import roomsReducer from './features/rooms'

export const store = configureStore({
    reducer: {
        register: registerReducer,
        login: loginReducer,
        hotels: hotelReducer,
        payment: paymentReducer,
        reviews: reviewsReducer,
        profile: profileReducer,
        bookings: bookingsReducer,
        rooms: roomsReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
