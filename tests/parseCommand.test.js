// Importing the required functions
const { parseCommand } = require('../garageDoorControl');
const { getUser } = require('../user');

// Mock getUser function for testing purposes
const mockUsers = {
  "1234567": { phone: "1234567", doors: [{ name: "left", status: "open" }, { name: "right", status: "closed" }] },
  "7654321": { phone: "7654321", doors: [{ name: "main", status: "closed" }] },
};

const mockGetUser = async (phone) => {
  return Promise.resolve(mockUsers[phone] || null);
};

// Override the original getUser function with the mock
require.cache[require.resolve('../user')].exports.getUser = mockGetUser;

const tests = {
  'should parse and validate open command': async () => {
    const result = await parseCommand('open left', '1234567');
    assert(result.includes('Opening left'), 'Test failed: should parse and validate open command');
  },
  'should parse and validate close command': async () => {
    const result = await parseCommand('close right', '1234567');
    assert(result.includes('Closing right'), 'Test failed: should parse and validate close command');
  },
  'should parse and validate status command': async () => {
    const result = await parseCommand('status left', '1234567');
    assert(result.includes('Status of left: open'), 'Test failed: should parse and validate status command');
  },
  'should handle invalid command format': async () => {
    const result = await parseCommand('open', '1234567');
    assert(result.includes('Invalid command format'), 'Test failed: should handle invalid command format');
  },
  'should handle invalid action': async () => {
    const result = await parseCommand('start left', '1234567');
    assert(result.includes('Invalid command'), 'Test failed: should handle invalid action');
  },
  'should handle non-existent user': async () => {
    const result = await parseCommand('open left', '0000000');
    assert(result.includes('User with phone number 0000000 not found'), 'Test failed: should handle non-existent user');
  },
  'should handle non-existent door': async () => {
    const result = await parseCommand('open non-existent', '1234567');
    assert(result.includes('Door \'non-existent\' not found'), 'Test failed: should handle non-existent door');
  },
  'should normalize commands (e.g., case insensitive)': async () => {
    const result1 = await parseCommand('Open left', '1234567');
    const result2 = await parseCommand('CLOSE right', '1234567');
    const result3 = await parseCommand('s left', '1234567');
    assert(result1.includes('Opening left'), 'Test failed: should normalize commands - case insensitive (open)');
    assert(result2.includes('Closing right'), 'Test failed: should normalize commands - case insensitive (close)');
    assert(result3.includes('Status of left: open'), 'Test failed: should normalize commands - case insensitive (status)');
  },
  'should handle multiple synonyms for commands': async () => {
    const result1 = await parseCommand('o left', '1234567');
    const result2 = await parseCommand('c right', '1234567');
    const result3 = await parseCommand('s left', '1234567');
    assert(result1.includes('Opening left'), 'Test failed: should handle synonyms (open)');
    assert(result2.includes('Closing right'), 'Test failed: should handle synonyms (close)');
    assert(result3.includes('Status of left: open'), 'Test failed: should handle synonyms (status)');
  },
};

module.exports = tests;
