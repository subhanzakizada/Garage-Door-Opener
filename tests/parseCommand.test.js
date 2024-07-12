require('dotenv').config();
const { parseCommand } = require('../garageDoorControl');
const { test, assert } = require('./common');
const { getUser, updateUser } = require('../user');

(async () => {

    // Mock functions for user and updateUser
    const mockUser = {
        phone: "+12532937820",
        doors: [
            { name: "left", status: "closed" },
            { name: "right", status: "opening" }
        ]
    };

    const mockGetUser = async (phone) => {
        if (phone === mockUser.phone) {
            return mockUser;
        }
        return null;
    };

    
    const mockUpdateUser = async (phone, doorName, status) => {
        const user = await mockGetUser(phone);
        const door = user.doors.find(d => d.name === doorName);
        if (door) {
            door.status = status;
        }
        return user;
    };

    try {
        test('Test command: status left', async () => {
            const result = await parseCommand(mockUser, 'status left');
            assert('Status of left: closed', result, "Status left command");
        });

        // Close the door that's already closed
        test('Test command: close left', async () => {
            const result = await parseCommand(mockUser, 'close left');
            assert('The door "left" is currently closed.', result, "Close left command");

            const status = await parseCommand(mockUser, 'status left');
            assert('Status of left: closed', status, "Status after closing left");
        });

        test('Test command: open left', async () => {
            const result = await parseCommand(mockUser, 'open left');
            assert('The door left is opening.', result, "Open left command");
            await mockUpdateUser("+12532937820", "left", "opening");

            const status = await parseCommand(mockUser, 'status left');
            assert('Status of left: opening', status, "Status after opening left");
        });

         
        // Close an "opening" door
        test('Test command: close right', async () => {
          const result = await parseCommand(mockUser, 'c right');
          assert('The door "right" is currently opening.', result, "Close right command");

          const status = await parseCommand(mockUser, 'status right');
          assert('Status of right: opening', status, "Status after opening right");
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
                await parseCommand("", 'status left');
            } catch (error) {
                assert("No phone", error.message, "No phone provided");
            }
        });

    } finally {}

})();
