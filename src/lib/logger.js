const logger = {
  error(message, details) {
    console.error(message, details || '');
  },
  info(message, details) {
    console.log(message, details || '');
  },
  warn(message, details) {
    console.warn(message, details || '');
  },
};

module.exports = logger;
