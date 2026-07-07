import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useComments(eventId) {
  return useQuery({
    queryKey: ['comments', eventId],
    queryFn: () => api.get(`/events/${eventId}/comments`).then((r) => r.data),
    enabled: !!eventId,
  });
}

export function useCreateComment(eventId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(`/events/${eventId}/comments`, payload).then((r) => r.data.comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', eventId] });
      qc.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

export function useDeleteComment(eventId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/comments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', eventId] });
      qc.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}
