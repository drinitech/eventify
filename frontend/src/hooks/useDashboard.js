import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useEventDashboard(eventId) {
  return useQuery({
    queryKey: ['dashboard', eventId],
    queryFn: () => api.get(`/events/${eventId}/dashboard`).then((r) => r.data),
    enabled: !!eventId,
  });
}

export function useAttendees(eventId) {
  return useQuery({
    queryKey: ['attendees', eventId],
    queryFn: () => api.get(`/events/${eventId}/attendees`).then((r) => r.data.attendees),
    enabled: !!eventId,
  });
}

export function useCheckInTicket(eventId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticketId) => api.patch(`/events/${eventId}/attendees/${ticketId}/checkin`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendees', eventId] });
      qc.invalidateQueries({ queryKey: ['dashboard', eventId] });
    },
  });
}

export function useCheckInByQr(eventId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (qrCode) => api.post(`/events/${eventId}/checkin-qr`, { qrCode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendees', eventId] });
      qc.invalidateQueries({ queryKey: ['dashboard', eventId] });
    },
  });
}

export function useBroadcastNotification(eventId) {
  return useMutation({
    mutationFn: (message) => api.post(`/events/${eventId}/notify`, { message }),
  });
}
