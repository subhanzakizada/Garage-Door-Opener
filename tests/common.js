const logger = require('../logger');

// Test runner function
exports.test = (description, fn) => {
    try {
      fn();
      logger.info(`✔️  ${description}`);
    } catch (error) {
      logger.error(`❌  ${description}`);
      logger.error(error);
    }
};

// Basic assertion function for testing
exports.assert = (expected, value, message) => {
    if(expected !== value){
      throw new Error((message || "Assertion failed: ") + '\nExpected: [' + expected + "] but got: [" + value + "]");  
    }
};