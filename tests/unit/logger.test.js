describe('logger', () => {
  const originalConsole = {
    error: console.error,
    log: console.log,
    warn: console.warn,
  };

  afterEach(() => {
    console.error = originalConsole.error;
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    jest.resetModules();
  });

  it('writes error, info and warn messages to console', () => {
    console.error = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();

    const logger = require('../../src/lib/logger');

    logger.error('error-message', { code: 1 });
    logger.info('info-message');
    logger.warn('warn-message', { code: 2 });

    expect(console.error).toHaveBeenCalledWith('error-message', { code: 1 });
    expect(console.log).toHaveBeenCalledWith('info-message', '');
    expect(console.warn).toHaveBeenCalledWith('warn-message', { code: 2 });
  });

  it('falls back to an empty string when details are not provided', () => {
    console.error = jest.fn();
    console.log = jest.fn();
    console.warn = jest.fn();

    const logger = require('../../src/lib/logger');

    logger.error('error-only');
    logger.warn('warn-only');

    expect(console.error).toHaveBeenCalledWith('error-only', '');
    expect(console.warn).toHaveBeenCalledWith('warn-only', '');
  });
});
