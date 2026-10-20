import { configureStore } from '@reduxjs/toolkit/react'
import registerReducer from './features/register'
import loginReducer from './features/login'
import hotelReducer from './features/hotels'


export const store = configureStore({
    reducer: {
        register: registerReducer,
        login: loginReducer,
        hotels: hotelReducer
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
