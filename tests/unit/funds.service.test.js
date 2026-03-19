const { createFundsService } = require('../../src/services/funds.service');

describe('funds service', () => {
  it('lists funds from the repository', async () => {
    const fundsRepository = {
      list: jest.fn().mockResolvedValue([
        { fundId: 1, name: 'Fund A' },
        { fundId: 2, name: 'Fund B' },
      ]),
    };

    const service = createFundsService({ fundsRepository });

    await expect(service.listFunds()).resolves.toEqual([
      { fundId: 1, name: 'Fund A' },
      { fundId: 2, name: 'Fund B' },
    ]);
  });
});
