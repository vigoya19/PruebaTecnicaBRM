const { z } = require('zod');
const { NOTIFICATION_PREFERENCES } = require('../config/constants');

const openSubscriptionSchema = z.object({
  fundId: z.coerce.number().int().positive(),
  notificationPreference: z.enum([
    NOTIFICATION_PREFERENCES.EMAIL,
    NOTIFICATION_PREFERENCES.SMS,
  ]),
});

const fundIdParamSchema = z.object({
  fundId: z.coerce.number().int().positive(),
});

module.exports = {
  fundIdParamSchema,
  openSubscriptionSchema,
};
