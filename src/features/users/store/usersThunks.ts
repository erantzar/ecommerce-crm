import { createAsyncThunk } from '@reduxjs/toolkit';
import { usersService } from '../services/usersService';
import { parseApiError } from '@/core/http/apiError';
import type { UserRole } from '@/types';

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await usersService.getAllUsers();
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ id, role }: { id: string; role: UserRole }, { rejectWithValue }) => {
    try {
      const res = await usersService.updateUserRole(id, role);
      return res.data.data;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await usersService.deleteUser(id);
      return id;
    } catch (e) {
      return rejectWithValue(parseApiError(e));
    }
  },
);
