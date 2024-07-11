// Test runner function
exports.test = (description, fn) => {
    try {
      fn();
      console.log(`✔️  ${description}`);
    } catch (error) {
      console.error(`❌  ${description}`);
      console.error(error);
    }
};

// Basic assertion function for testing
exports.assert = (expected, value, message) => {
    if(expected !== value){
      throw new Error((message || "Assertion failed: ") + '\nExpected: [' + expected + "] but got: [" + value + "]");  
    }
};