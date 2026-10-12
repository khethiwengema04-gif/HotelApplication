import { configureStore } from '@reduxjs/toolkit/react'
import registerReducer from './features/register'
import { loginSlice } from './features/login'


export const store = configureStore({
    reducer: {
        register: registerReducer,
        login: loginSlice.reducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
