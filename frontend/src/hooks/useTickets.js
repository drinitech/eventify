import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets', 'mine'],
    queryFn: () => api.get('/tickets/mine').then((r) => r.data.tickets),
  });
}

export function useRsvp(eventId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/events/${eventId}/rsvp`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', 'mine'] });
      qc.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

export function useCancelRsvp(eventId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/events/${eventId}/rsvp`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tickets', 'mine'] });
      qc.invalidateQueries({ queryKey: ['event', eventId] });
    },
  });
}

export function useTicketQr(ticketId) {
  return useQuery({
    queryKey: ['ticket-qr', ticketId],
    queryFn: () => api.get(`/tickets/${ticketId}/qrcode`).then((r) => r.data.qrImage),
    enabled: !!ticketId,
  });
}
