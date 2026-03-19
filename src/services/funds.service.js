const toFundResponse = (fund) => ({
  fundId: fund.fundId,
  name: fund.name,
  minimumAmount: fund.minimumAmount,
  category: fund.category,
  isActive: fund.isActive,
});

const createFundsService = ({ fundsRepository }) => ({
  async listFunds() {
    const funds = await fundsRepository.list();
    return funds.map(toFundResponse);
  },
});

module.exports = {
  createFundsService,
};
