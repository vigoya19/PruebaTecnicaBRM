const { createNotificationsService } = require('../../src/services/notifications.service');

jest.mock('../../src/lib/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('notifications service', () => {
  beforeEach(() => {
    process.env.SES_FROM_EMAIL = 'sender@example.com';
    jest.resetModules();
  });

  it('returns SIMULATED when no real channel can be used', async () => {
    const { createNotificationsService: createFreshNotificationsService } = require('../../src/services/notifications.service');

    const service = createFreshNotificationsService({
      sesClient: { send: jest.fn() },
      snsClient: { send: jest.fn() },
    });

    await expect(
      service.sendSubscriptionCreated({
        customer: {
          customerId: 'customer-1',
          email: '',
          phone: '',
        },
        fundName: 'Fund A',
        amount: 100000,
        preference: 'email',
      }),
    ).resolves.toBe('SIMULATED');
  });

  it('returns FAILED when the provider throws an error', async () => {
    const { createNotificationsService: createFreshNotificationsService } = require('../../src/services/notifications.service');

    const service = createFreshNotificationsService({
      sesClient: {
        send: jest.fn().mockRejectedValue(new Error('SES failure')),
      },
      snsClient: { send: jest.fn() },
    });

    await expect(
      service.sendSubscriptionCreated({
        customer: {
          customerId: 'customer-1',
          email: 'customer@example.com',
          phone: '',
        },
        fundName: 'Fund A',
        amount: 100000,
        preference: 'email',
      }),
    ).resolves.toBe('FAILED');
  });

  it('returns SENT when email delivery succeeds', async () => {
    const { createNotificationsService: createFreshNotificationsService } = require('../../src/services/notifications.service');

    const service = createFreshNotificationsService({
      sesClient: {
        send: jest.fn().mockResolvedValue({ MessageId: '1' }),
      },
      snsClient: { send: jest.fn() },
    });

    await expect(
      service.sendSubscriptionCreated({
        customer: {
          customerId: 'customer-1',
          email: 'customer@example.com',
          phone: '',
        },
        fundName: 'Fund A',
        amount: 100000,
        preference: 'email',
      }),
    ).resolves.toBe('SENT');
  });

  it('returns SENT when sms delivery succeeds', async () => {
    const { createNotificationsService: createFreshNotificationsService } = require('../../src/services/notifications.service');

    const service = createFreshNotificationsService({
      sesClient: { send: jest.fn() },
      snsClient: {
        send: jest.fn().mockResolvedValue({ MessageId: '1' }),
      },
    });

    await expect(
      service.sendSubscriptionCreated({
        customer: {
          customerId: 'customer-1',
          email: '',
          phone: '+573001112233',
        },
        fundName: 'Fund A',
        amount: 100000,
        preference: 'sms',
      }),
    ).resolves.toBe('SENT');
  });
});
