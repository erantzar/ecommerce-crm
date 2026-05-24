import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { injectDispatch } from '@/core/http/axiosClient';

export const store = configureStore({
  reducer: rootReducer,
  // Disable Redux DevTools in production — prevents exposing admin state
  // (orders, user PII, JWT token) via the browser extension or
  // window.__REDUX_DEVTOOLS_EXTENSION__ global.
  devTools: process.env.NODE_ENV !== 'production',
});

injectDispatch(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
