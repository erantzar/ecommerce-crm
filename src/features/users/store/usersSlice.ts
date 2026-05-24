import { createSlice } from '@reduxjs/toolkit';
import type { AdminUser } from '@/types';
import { fetchAllUsers, updateUserRole, deleteUser } from './usersThunks';
import { logoutThunk } from '@/features/auth/store/authThunks';

interface UsersState {
  items: AdminUser[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  roleUpdateStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  deleteStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: null,
  roleUpdateStatus: 'idle',
  deleteStatus: 'idle',
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message ?? 'Failed to load users';
      });

    builder
      .addCase(updateUserRole.pending, (state) => { state.roleUpdateStatus = 'loading'; })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.roleUpdateStatus = 'succeeded';
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateUserRole.rejected, (state) => { state.roleUpdateStatus = 'failed'; });

    builder
      .addCase(deleteUser.pending, (state) => { state.deleteStatus = 'loading'; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.items = state.items.filter((u) => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state) => { state.deleteStatus = 'failed'; });

    builder.addCase(logoutThunk.fulfilled, () => initialState);
    builder.addCase(logoutThunk.rejected, () => initialState);
  },
});

export default usersSlice.reducer;
