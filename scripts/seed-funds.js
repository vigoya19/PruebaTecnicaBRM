const { DEFAULT_FUNDS } = require('../src/config/constants');
const { documentClient } = require('../src/lib/dynamodb');
const { createFundsRepository } = require('../src/repositories/funds.repository');

const seed = async () => {
  const repository = createFundsRepository({ documentClient });
  await repository.seed(DEFAULT_FUNDS);
  console.log('Funds seeded successfully');
};

seed().catch((error) => {
  console.error('Unable to seed funds', error);
  process.exit(1);
});
