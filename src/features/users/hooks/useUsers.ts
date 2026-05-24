'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/core/store/hooks';
import {
  selectAllUsers,
  selectUsersStatus,
  selectUsersError,
  selectRoleUpdateStatus,
  selectDeleteStatus,
} from '../store/usersSelectors';
import { fetchAllUsers, updateUserRole, deleteUser } from '../store/usersThunks';
import type { UserRole } from '@/types';

export function useUsers() {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const status = useAppSelector(selectUsersStatus);
  const error = useAppSelector(selectUsersError);
  const roleUpdateStatus = useAppSelector(selectRoleUpdateStatus);
  const deleteStatus = useAppSelector(selectDeleteStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, status]);

  return {
    users,
    status,
    error,
    roleUpdateStatus,
    deleteStatus,
    updateUserRole: (id: string, role: UserRole) => dispatch(updateUserRole({ id, role })),
    deleteUser: (id: string) => dispatch(deleteUser(id)),
  };
}
