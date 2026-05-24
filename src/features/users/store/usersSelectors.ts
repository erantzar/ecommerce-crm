import type { RootState } from '@/core/store/store';

export const selectAllUsers = (state: RootState) => state.users.items;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectRoleUpdateStatus = (state: RootState) => state.users.roleUpdateStatus;
export const selectDeleteStatus = (state: RootState) => state.users.deleteStatus;
