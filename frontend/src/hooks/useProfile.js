import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload) => api.patch('/auth/me', payload).then((r) => r.data.user),
  });
}
