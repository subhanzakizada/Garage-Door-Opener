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
exports.assert = (condition, message) => {
    if(!condition){
      throw new Error(message || "Assertion failed");
    }
};