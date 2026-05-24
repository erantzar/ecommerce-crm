import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import usersReducer from '../store/usersSlice';
import { fetchAllUsers, updateUserRole, deleteUser } from '../store/usersThunks';
import type { AdminUser } from '@/types';

function makeStore() {
  return configureStore({ reducer: { users: usersReducer } });
}

const mockUser: AdminUser = {
  _id: 'user1',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'customer',
  isVerified: true,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('usersSlice', () => {
  let store: ReturnType<typeof makeStore>;

  beforeEach(() => {
    store = makeStore();
  });

  it('starts with idle status', () => {
    expect(store.getState().users.status).toBe('idle');
  });

  it('populates users on fetchAllUsers.fulfilled', () => {
    store.dispatch({ type: fetchAllUsers.fulfilled.type, payload: [mockUser] });
    const state = store.getState().users;
    expect(state.status).toBe('succeeded');
    expect(state.items).toHaveLength(1);
    expect(state.items[0]._id).toBe('user1');
  });

  it('updates user role on updateUserRole.fulfilled', () => {
    store.dispatch({ type: fetchAllUsers.fulfilled.type, payload: [mockUser] });
    store.dispatch({
      type: updateUserRole.fulfilled.type,
      payload: { ...mockUser, role: 'admin' },
    });
    expect(store.getState().users.items[0].role).toBe('admin');
  });

  it('removes user on deleteUser.fulfilled', () => {
    store.dispatch({ type: fetchAllUsers.fulfilled.type, payload: [mockUser] });
    store.dispatch({ type: deleteUser.fulfilled.type, payload: 'user1' });
    expect(store.getState().users.items).toHaveLength(0);
  });

  it('keeps other users when one is deleted', () => {
    const user2: AdminUser = { ...mockUser, _id: 'user2', name: 'Bob', email: 'bob@test.com' };
    store.dispatch({ type: fetchAllUsers.fulfilled.type, payload: [mockUser, user2] });
    store.dispatch({ type: deleteUser.fulfilled.type, payload: 'user1' });
    expect(store.getState().users.items).toHaveLength(1);
    expect(store.getState().users.items[0]._id).toBe('user2');
  });
});
