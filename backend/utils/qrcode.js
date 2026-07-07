const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

function signQrToken(ticketId) {
  return jwt.sign({ ticketId }, process.env.QR_SECRET);
}

function verifyQrToken(token) {
  return jwt.verify(token, process.env.QR_SECRET);
}

function renderQrDataUrl(text) {
  return QRCode.toDataURL(text);
}

module.exports = { signQrToken, verifyQrToken, renderQrDataUrl };
