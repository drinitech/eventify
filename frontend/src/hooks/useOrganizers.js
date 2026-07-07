import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useOrganizerProfile(id) {
  return useQuery({
    queryKey: ['organizer', id],
    queryFn: () => api.get(`/organizers/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useMyFollowing(enabled = true) {
  return useQuery({
    queryKey: ['following', 'mine'],
    queryFn: () => api.get('/organizers/following/mine').then((r) => r.data.following),
    enabled,
  });
}

export function useFollowOrganizer(organizerId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/organizers/${organizerId}/follow`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizer', organizerId] });
      qc.invalidateQueries({ queryKey: ['following', 'mine'] });
    },
  });
}

export function useUnfollowOrganizer(organizerId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/organizers/${organizerId}/follow`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organizer', organizerId] });
      qc.invalidateQueries({ queryKey: ['following', 'mine'] });
    },
  });
}
