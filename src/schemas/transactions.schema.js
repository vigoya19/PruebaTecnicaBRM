const { z } = require('zod');

const transactionsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = {
  transactionsQuerySchema,
};
