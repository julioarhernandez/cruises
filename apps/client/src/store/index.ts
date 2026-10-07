import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import chatReducer from './chatSlice'

// A function so tests can start every case with a fresh, empty store.
export function makeStore() {
  return configureStore({
    reducer: {
      chat: chatReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

// Typed versions of the react-redux hooks, so components get autocomplete
// for the state shape and can dispatch thunks without casting.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
