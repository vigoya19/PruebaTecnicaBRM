const INITIAL_BALANCE = 500000;

const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
};

const NOTIFICATION_PREFERENCES = {
  EMAIL: 'email',
  SMS: 'sms',
};

const TRANSACTION_TYPES = {
  OPEN: 'OPEN',
  CANCEL: 'CANCEL',
};

const DEFAULT_FUNDS = [
  {
    fundId: 1,
    name: 'FPV_BTG_PACTUAL_RECAUDADORA',
    minimumAmount: 75000,
    category: 'FPV',
  },
  {
    fundId: 2,
    name: 'FPV_BTG_PACTUAL_ECOPETROL',
    minimumAmount: 125000,
    category: 'FPV',
  },
  {
    fundId: 3,
    name: 'DEUDAPRIVADA',
    minimumAmount: 50000,
    category: 'FIC',
  },
  {
    fundId: 4,
    name: 'FDO-ACCIONES',
    minimumAmount: 250000,
    category: 'FIC',
  },
  {
    fundId: 5,
    name: 'FPV_BTG_PACTUAL_DINAMICA',
    minimumAmount: 100000,
    category: 'FPV',
  },
];

module.exports = {
  DEFAULT_FUNDS,
  INITIAL_BALANCE,
  NOTIFICATION_PREFERENCES,
  ROLES,
  TRANSACTION_TYPES,
};
