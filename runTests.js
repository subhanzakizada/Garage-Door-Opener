const fs = require('fs');
const path = require('path');

// Simple assertion function
global.assert = function(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Simple test function
function test(description, fn) {
  try {
    fn();
    console.log(`✔️  ${description}`);
  } catch (error) {
    console.error(`❌  ${description}`);
    console.error(error);
  }
}

// Load and run all test files
const testDir = path.join(__dirname, 'tests'); // creating a path, basically testDir = /Users/subhanzaki-zada/Documents/Garage-Door-Opener/tests
const testFiles = fs.readdirSync(testDir); // an array with the names of the files in the directory passed in

// console.log(__dirname); // /Users/subhanzaki-zada/Documents/Garage-Door-Opener
// console.log(__dirname); // [ 'parseCommand.test.js' ]

testFiles.forEach((file) => {
  if (file.endsWith('.test.js')) {
    const tests = require(path.join(testDir, file));
    Object.entries(tests).forEach(([description, fn]) => {
      test(description, fn);
    });
  }
});
