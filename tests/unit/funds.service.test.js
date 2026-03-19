const { createFundsService } = require('../../src/services/funds.service');

describe('funds service', () => {
  it('lists funds from the repository', async () => {
    const fundsRepository = {
      list: jest.fn().mockResolvedValue([
        {
          fundId: 1,
          name: 'Fund A',
          minimumAmount: 1000,
          category: 'FPV',
          isActive: true,
          PK: 'FUND#1',
          SK: 'METADATA',
        },
        {
          fundId: 2,
          name: 'Fund B',
          minimumAmount: 2000,
          category: 'FIC',
          isActive: true,
          PK: 'FUND#2',
          SK: 'METADATA',
        },
      ]),
    };

    const service = createFundsService({ fundsRepository });

    await expect(service.listFunds()).resolves.toEqual([
      {
        fundId: 1,
        name: 'Fund A',
        minimumAmount: 1000,
        category: 'FPV',
        isActive: true,
      },
      {
        fundId: 2,
        name: 'Fund B',
        minimumAmount: 2000,
        category: 'FIC',
        isActive: true,
      },
    ]);
  });
});
