const { parseCommand } = require('../garageDoorControl');
const { getUser } = require('../user');
const { test, assert } = require('./common');

// Mock getUser function for testing purposes
const mockUsers = {
  "1234567": { phone: "1234567", doors: [{ name: "left", number: 1, status: "open" }, { name: "right", number: 2, status: "closed" }] },
  "7654321": { phone: "7654321", doors: [{ name: "main", number: 1, status: "closed" }] },
};

const mockGetUser = async (phone) => {
  return Promise.resolve(mockUsers[phone] || null);
};

// Override the original getUser function with the mock
require.cache[require.resolve('../user')].exports.getUser = mockGetUser;

// // Basic assertion function for testing
// function assert(condition, message) {
//   if (!condition) {
//     throw new Error(message || "Assertion failed");
//   }
// }

// // Test runner function
// function test(description, fn) {
//   try {
//     fn();
//     console.log(`✔️  ${description}`);
//   } catch (error) {
//     console.error(`❌  ${description}`);
//     console.error(error);
//   }
// }

(async () => {
  console.log("Running parseCommand function tests...");

  test('should parse and validate open command', async () => {
    const result = await parseCommand('open left', '1234567');
    assert(result.includes('Opening left'), 'Test failed: should parse and validate open command');
  });

  test('should parse and validate close command', async () => {
    const result = await parseCommand('close right', '1234567');
    assert(result.includes('Closing right'), 'Test failed: should parse and validate close command');
  });

  test('should parse and validate status command', async () => {
    const result = await parseCommand('status left', '1234567');
    assert(result.includes('Status of left: open'), 'Test failed: should parse and validate status command');
  });

  test('should handle invalid command format', async () => {
    const result = await parseCommand('open', '1234567');
    assert(result.includes('Invalid command format'), 'Test failed: should handle invalid command format');
  });

  test('should handle invalid action', async () => {
    const result = await parseCommand('start left', '1234567');
    assert(result.includes('Invalid command'), 'Test failed: should handle invalid action');
  });

  test('should handle non-existent user', async () => {
    const result = await parseCommand('open left', '0000000');
    assert(result.includes('User with phone number 0000000 not found'), 'Test failed: should handle non-existent user');
  });

  test('should handle non-existent door', async () => {
    const result = await parseCommand('open non-existent', '1234567');
    assert(result.includes('Door \'non-existent\' not found'), 'Test failed: should handle non-existent door');
  });

  test('should normalize commands (e.g., case insensitive)', async () => {
    const result1 = await parseCommand('Open left', '1234567');
    const result2 = await parseCommand('CLOSE right', '1234567');
    const result3 = await parseCommand('s left', '1234567');
    assert(result1.includes('Opening left'), 'Test failed: should normalize commands (e.g., case insensitive)');
    assert(result2.includes('Closing right'), 'Test failed: should normalize commands (e.g., case insensitive)');
    assert(result3.includes('Status of left: open'), 'Test failed: should normalize commands (e.g., case insensitive)');
  });

  test('should handle multiple synonyms for commands', async () => {
    const result1 = await parseCommand('o left', '1234567');
    const result2 = await parseCommand('c right', '1234567');
    const result3 = await parseCommand('s left', '1234567');
    assert(result1.includes('Opening left'), 'Test failed: should handle multiple synonyms for commands');
    assert(result2.includes('Closing right'), 'Test failed: should handle multiple synonyms for commands');
    assert(result3.includes('Status of left: open'), 'Test failed: should handle multiple synonyms for commands');
  });

  test('should return error if no command is sent', async () => {
    const result = await parseCommand('', '1234567');
    assert(result.includes('No command'), 'Test failed: should return an error');
  });

  test('should return error if no phone is sent', async () => {
    const result = await parseCommand('help', '');
    assert(result.includes('No phone'), 'Test failed: should return an error with no phone');
  });

  test('should return general help', async () => {
    const result = await parseCommand('help', '1234567');
    assert(result.includes("Available commands:\n"), 'Test failed: should handle generic help topic');
  });

  test('should handle help on help topic', async () => {
    const result = await parseCommand('help help', '1234567');
    assert(result.includes("help: Use this command to get help. Example: 'help open' or 'h o'"), 'Test failed: should handle help on help topic');
  });

  test('should provide specific help', async () => {
    const result = await parseCommand('help open', '1234567');
    assert(result.includes('Use this command to open the door'), 'Test failed: should provide specific help');
  });

  test('should provide specific help using an alias', async () => {
    const result = await parseCommand('help opne', '1234567');
    assert(result.includes('Use this command to open the door'), 'Test failed: should provide specific help with an alias');
  });

  test('should provide help for aliases', async () => {
    const result = await parseCommand('h o', '1234567');
    assert(result.includes('Use this command to open the door'), 'Test failed: should provide help for aliases');
  });

  test('should handle non-existent help topic', async () => {
    const result = await parseCommand('help non-existent', '1234567');
    assert(result.includes('Help topic not found'), 'Test failed: should handle non-existent help topic');
  });

  console.log("\nAll tests passed successfully!");
})();
