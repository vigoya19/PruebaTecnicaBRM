const { PublishCommand } = require('@aws-sdk/client-sns');
const { SendEmailCommand } = require('@aws-sdk/client-sesv2');
const env = require('../config/env');
const { NOTIFICATION_PREFERENCES } = require('../config/constants');
const logger = require('../lib/logger');

const createNotificationsService = ({ sesClient, snsClient }) => ({
  async sendSubscriptionCreated({ customer, fundName, amount, preference }) {
    const message = `Su suscripcion al fondo ${fundName} por COP ${amount} fue creada correctamente.`;

    try {
      if (
        preference === NOTIFICATION_PREFERENCES.EMAIL &&
        customer.email &&
        env.sesFromEmail
      ) {
        await sesClient.send(
          new SendEmailCommand({
            FromEmailAddress: env.sesFromEmail,
            Destination: {
              ToAddresses: [customer.email],
            },
            Content: {
              Simple: {
                Subject: { Data: 'Suscripcion creada' },
                Body: {
                  Text: {
                    Data: message,
                  },
                },
              },
            },
          }),
        );

        return 'SENT';
      }

      if (preference === NOTIFICATION_PREFERENCES.SMS && customer.phone) {
        await snsClient.send(
          new PublishCommand({
            PhoneNumber: customer.phone,
            Message: message,
          }),
        );

        return 'SENT';
      }

      logger.info('Notification simulated', {
        customerId: customer.customerId,
        fundName,
        preference,
      });

      return 'SIMULATED';
    } catch (error) {
      logger.error('Notification delivery failed', {
        customerId: customer.customerId,
        fundName,
        preference,
        error: error.message,
      });

      return 'FAILED';
    }
  },
});

module.exports = {
  createNotificationsService,
};
