import { useTicketQr } from '../hooks/useTickets';

export function TicketQR({ ticketId }) {
  const { data: qrImage, isLoading } = useTicketQr(ticketId);

  if (isLoading) return <p className="text-sm text-gray-400">Duke ngarkuar QR...</p>;
  if (!qrImage) return null;

  return <img src={qrImage} alt="QR Code i biletes" className="w-40 h-40" />;
}
