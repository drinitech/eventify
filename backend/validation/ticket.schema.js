const { z } = require('zod');

const checkInQrSchema = z.object({
  qrCode: z.string().min(1),
});

module.exports = { checkInQrSchema };
