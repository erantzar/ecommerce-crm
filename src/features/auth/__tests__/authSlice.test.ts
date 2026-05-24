import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearAuth, clearTwoFAStep } from '../store/authSlice';
import { adminLoginThunk, verify2FAThunk } from '../store/authThunks';
import type { AuthState } from '@/types';

function makeStore() {
  return configureStore({ reducer: { auth: authReducer } });
}

describe('authSlice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('starts with idle status', () => {
    const state = store.getState().auth as AuthState;
    expect(state.status).toBe('idle');
    expect(state.twoFAStep).toBe(false);
    // token is no longer stored in Redux state (localStorage only)
    expect(state.tokenExpiresAt).toBeNull();
  });

  it('sets status to loading on adminLogin.pending', () => {
    store.dispatch({ type: adminLoginThunk.pending.type });
    expect((store.getState().auth as AuthState).status).toBe('loading');
  });

  it('sets twoFAStep and userId on adminLogin.fulfilled', () => {
    store.dispatch({
      type: adminLoginThunk.fulfilled.type,
      payload: { userId: 'abc123' },
    });
    const state = store.getState().auth as AuthState;
    expect(state.twoFAStep).toBe(true);
    expect(state.userId).toBe('abc123');
    expect(state.status).toBe('succeeded');
  });

  it('sets error on adminLogin.rejected', () => {
    store.dispatch({
      type: adminLoginThunk.rejected.type,
      payload: { message: 'Invalid admin credentials' },
    });
    const state = store.getState().auth as AuthState;
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Invalid admin credentials');
  });

  it('sets tokenExpiresAt and clears twoFAStep on verify2FA.fulfilled', () => {
    store.dispatch({
      type: verify2FAThunk.fulfilled.type,
      payload: 'my-jwt-token',
    });
    const state = store.getState().auth as AuthState;
    // Raw token is NOT stored in Redux (lives in localStorage only)
    expect(state.twoFAStep).toBe(false);
    expect(state.tokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it('clearAuth resets to initial state', () => {
    store.dispatch({ type: adminLoginThunk.fulfilled.type, payload: { userId: 'x' } });
    store.dispatch(clearAuth());
    const state = store.getState().auth as AuthState;
    expect(state.twoFAStep).toBe(false);
    expect(state.userId).toBeNull();
  });

  it('clearTwoFAStep resets twoFA state', () => {
    store.dispatch({ type: verify2FAThunk.fulfilled.type, payload: 'token' });
    store.dispatch({ type: adminLoginThunk.fulfilled.type, payload: { userId: 'y' } });
    store.dispatch(clearTwoFAStep());
    const state = store.getState().auth as AuthState;
    expect(state.twoFAStep).toBe(false);
    expect(state.userId).toBeNull();
  });
});
