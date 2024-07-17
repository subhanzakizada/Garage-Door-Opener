const logger = require('../logger');

const { log } = console;

// Test runner function
exports.test = (description, fn) => {
    try {
      fn();
      log(`✔️  ${description}`);
    } catch (error) {
      log(`❌  ${description}`);
      log(error);
    }
};

// Basic assertion function for testing
exports.assert = (expected, value, message) => {
    if(expected !== value){
      throw new Error((message || "Assertion failed: ") + '\nExpected: [' + expected + "] but got: [" + value + "]");  
    }
};