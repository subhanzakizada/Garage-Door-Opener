/*
    Integration tests for the garage door control system. Requires a database connection
    defined in the .env file.
*/

const { processCommand } = require('../garageDoorControl');
const { processEvent } = require('../garageDoorControlSM');
const { test, assert } = require('./common');
const users = require('../user');

const { log } = console;

(async () => {
    try {

        //Reset all possible users with the same phone
        await users.deleteUserByPhone('123456789');

        log('Starting integration tests');

        test('Process door open', async () => {

            //setup
            var u = await users.createUser('123456789', 
                            'API-KEY-123456', 
                            [{ name: 'left', controllerId: 'USER-CTRL-1', status: 'closed' }]);
        
            //log(u);

            var user = await users.getUserByPhone('123456789');
            //log(user);

            var result = await processCommand(user, 'open left');
            //log(result);

            assert('The door left is opening.', result.msg, "Open left command");
            assert('opening', result.newState, "Status after opening left");


            //Simualtes API call
            user = await users.getUserByKey('API-KEY-123456');
            //log(user);
            
            var door = user.doors.find(d => d.name === 'left');
            assert('opening', door.status, "Status after opening left");

            result = await processEvent('open_complete', door);
            //log(result);
            
            result = await users.updateUserDoorStatus(user, result);
            //log(result);
            
            user = await users.getUserByPhone('123456789');
            door = user.doors.find(d => d.name === 'left');
            assert('open', door.status, "Status after opening left");
        });
    } catch (error) {
        log(error);
    }
})();