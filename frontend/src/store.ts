
import { configureStore } from '@reduxjs/toolkit'
import registerReducer from './features/register'
import loginReducer from './features/login'
import hotelReducer from './features/hotels'
import paymentReducer from './features/payment'

export const store = configureStore({
    reducer: {
        register: registerReducer,
        login: loginReducer,
        hotels: hotelReducer,
        payment: paymentReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
