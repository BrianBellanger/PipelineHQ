import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listUsers, updateUser } from '@/api/users.api';
import type { ListUsersParams, UpdateUserPayload } from '@/api/users.api';
import { toast } from 'sonner';

const userKeys = {
  all: ['users'] as const,
  list: (params: ListUsersParams) => ['users', 'list', params] as const,
};

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => listUsers(params),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User updated');
    },
    onError: () => {
      toast.error('Failed to update user');
    },
  });
}
