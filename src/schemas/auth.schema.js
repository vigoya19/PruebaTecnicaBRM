const { z } = require('zod');
const { NOTIFICATION_PREFERENCES, ROLES } = require('../config/constants');

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[a-z]/, 'Password must include a lowercase letter')
      .regex(/[A-Z]/, 'Password must include an uppercase letter')
      .regex(/[0-9]/, 'Password must include a number')
      .regex(/[^A-Za-z0-9]/, 'Password must include a special character'),
    name: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum([ROLES.CUSTOMER, ROLES.ADMIN]).optional(),
    notificationPreference: z.enum([
      NOTIFICATION_PREFERENCES.EMAIL,
      NOTIFICATION_PREFERENCES.SMS,
    ]),
  })
  .superRefine((value, context) => {
    if (
      value.notificationPreference === NOTIFICATION_PREFERENCES.SMS &&
      !value.phone
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone is required when notificationPreference is sms',
        path: ['phone'],
      });
    }
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

module.exports = {
  loginSchema,
  registerSchema,
};
