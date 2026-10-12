import { configureStore } from '@reduxjs/toolkit/react'
import registerReducer from './features/register'


export const store = configureStore({
    reducer: {
        register: registerReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
