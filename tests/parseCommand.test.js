const { parseCommand } = require('../garageDoorControl');
const { test, assert } = require('./common');

const { log } = console;

(async () => {

    // Mock functions for user and updateUser
    const mockUser = {
        phone: "+12532937820",
        doors: [
            { name: "left", status: "closed" },
            { name: "right", status: "opening" }
        ]
    };

    try {
        test('Test command: status left', async () => {
            const result = await parseCommand(mockUser, 'status left');
            //log(result);
            assert('Status of door "left" is closed', result.msg, "Status left command");
        });

        test('Test command: s left', async () => {
            const result = await parseCommand(mockUser, 's left');
            //log(result);
            assert('Status of door "left" is closed', result.msg, "Status left command");
        });

        test('Test command: close left', async () => {
            const result = await parseCommand(mockUser, 'close left');
            assert('The door "left" is currently closed.', result.msg, "Close left command");

            const status = await parseCommand(mockUser, 'status left');
            assert('Status of door "left" is closed', status.msg, "Status after closing left");
        });

        test('Test command: open left', async () => {
            const result = await parseCommand(mockUser, 'open left');
            assert('Request to open door left received.', result.msg, "Open left command");
            assert('opening_request', result.newState, "Status after opening left");
            mockUser.doors[0].status = result.newState;
            
            const status = await parseCommand(mockUser, 'status left');
            assert('Status of door "left" is opening_request', status.msg, "Status after opening left");
        });
         
        // Close an "opening" door
        test('Test command: close right', async () => {
            const result = await parseCommand(mockUser, 'c right');
            assert('opening', result.newState, "Status after close an right on opening");
            assert('The door "right" is currently opening.', result.msg, "Close right command");
            
            const status = await parseCommand(mockUser, 'status right');
            assert('Status of door "right" is opening', status.msg, "Status after opening right");
        });

        test('Test invalid command', async () => {
            try {
                await parseCommand(mockUser, 'invalidcommand');
            } catch (error) {
                assert("Invalid command. Supported commands are 'open', 'close', 'status', 'help'.", "Invalid command", error.message);
            }
        });

        test('Test no command', async () => {
            try {
                await parseCommand(mockUser, '');
            } catch (error) {
                assert("No command", error.message, "No command provided");
            }
        });

        test('Test no user', async () => {
            try {
                await parseCommand(null, 'status left');
            } catch (error) {
                assert("Invalid user", error.message, "Invalid user");
            }
        });

        test('Test invalid user', async () => {
          try {
              await parseCommand("not an object", 'status left');
          } catch (error) {
              assert("Invalid user", error.message, "Invalid user");
          }
        });

        test('Test close with insufficient parameters', async () => {
          const result = await parseCommand({ doors: [{}]}, 'close');
          const expected = 'Invalid command format.'
          assert(expected, result.msg.substring(0, expected.length), "Insufficient parameters for close");
        });

        test('Test user with no doors', async () => {
          const result = await parseCommand({doors: []}, 'close left');
          assert("User has no doors", result.msg, "No doors for user");
        });

        test('Test user with undefined doors', async () => {
          const result = await parseCommand({}, 'close left');
          assert("User has no doors", result.msg, "No doors for user");
        });


    } finally {}

})();
