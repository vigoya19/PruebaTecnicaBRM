const createFundsService = ({ fundsRepository }) => ({
  async listFunds() {
    return fundsRepository.list();
  },
});

module.exports = {
  createFundsService,
};
