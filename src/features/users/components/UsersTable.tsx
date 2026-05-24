'use client';

import { useCallback, useMemo } from 'react';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSelector } from '@/core/store/hooks';
import { useUsers } from '../hooks/useUsers';
import { updateUserRole as updateUserRoleThunk, deleteUser as deleteUserThunk } from '../store/usersThunks';
import type { AdminUser, UserRole } from '@/types';

export default function UsersTable() {
  const { users, status, updateUserRole, deleteUser } = useUsers();
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const currentUserId = currentUser?._id ?? null;

  const isLoading = status === 'loading';

  const performRoleUpdate = useCallback(async (id: string, role: UserRole) => {
    const result = await updateUserRole(id, role);
    if (updateUserRoleThunk.fulfilled.match(result as never)) {
      toast.success('Role updated');
    } else {
      toast.error('Role update failed');
    }
  }, [updateUserRole]);

  const handleRoleChange = useCallback((id: string, newRole: UserRole) => {
    if (id === currentUserId) {
      toast.error("You cannot change your own role.");
      return;
    }
    if (newRole === 'admin') {
      toast('Grant admin access?', {
        description: 'This user will have full admin access to the CRM. Are you sure?',
        action: {
          label: 'Confirm',
          onClick: () => performRoleUpdate(id, newRole),
        },
        cancel: {
          label: 'Cancel',
          onClick: () => {},
        },
        duration: 8000,
      });
      return;
    }
    performRoleUpdate(id, newRole);
  }, [currentUserId, performRoleUpdate]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (id === currentUserId) {
      toast.error("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const result = await deleteUser(id);
    if (deleteUserThunk.fulfilled.match(result as never)) {
      toast.success(`User "${name}" deleted`);
    } else {
      toast.error('Delete failed');
    }
  }, [currentUserId, deleteUser]);

  // useMemo keyed on currentUserId so DataGrid re-evaluates renderCell
  // as soon as fetchMeThunk resolves and currentUser is populated.
  const columns = useMemo<GridColDef[]>(() => [
    {
      field: 'image',
      headerName: '',
      width: 56,
      sortable: false,
      renderCell: (params) => {
        const user = params.row as AdminUser;
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        );
      },
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'role',
      headerName: 'Role',
      width: 160,
      renderCell: (params) => {
        const user = params.row as AdminUser;
        const isSelf = user._id === currentUserId;
        return (
          <Select
            value={user.role}
            onValueChange={(v) => handleRoleChange(user._id, v as UserRole)}
            disabled={isSelf}
          >
            <SelectTrigger className="h-8 w-32" title={isSelf ? "You cannot change your own role" : undefined}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      field: 'isVerified',
      headerName: 'Verified',
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Badge className="bg-green-100 text-green-700">Verified</Badge>
        ) : (
          <Badge variant="secondary">Pending</Badge>
        ),
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 110,
      renderCell: (params) => new Date(params.value as string).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const user = params.row as AdminUser;
        const isSelf = user._id === currentUserId;
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(user._id, user.name)}
            disabled={isSelf}
            title={isSelf ? "You cannot delete your own account" : undefined}
          >
            Delete
          </Button>
        );
      },
    },
  ], [currentUserId, handleRoleChange, handleDelete]);

  if (isLoading && users.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row: AdminUser) => row._id}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        pageSizeOptions={[10, 25, 50]}
        loading={isLoading}
        disableRowSelectionOnClick
        autoHeight
        sx={{ border: 'none' }}
      />
    </div>
  );
}

