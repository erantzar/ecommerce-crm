import { createSlice } from '@reduxjs/toolkit';
import { fetchDashboardData, type DashboardMetrics } from './dashboardThunks';
import { logoutThunk } from '@/features/auth/store/authThunks';

interface DashboardState {
  metrics: DashboardMetrics | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        const payload = action.payload as { message: string } | undefined;
        state.error = payload?.message ?? 'Failed to load dashboard';
      });

    builder.addCase(logoutThunk.fulfilled, () => initialState);
    builder.addCase(logoutThunk.rejected, () => initialState);
  },
});

export default dashboardSlice.reducer;
