/*
    Integration tests for the garage door control system. Requires a database connection
    defined in the .env file.
*/

require('dotenv').config();

const { processCommand } = require('../garageDoorControl');
const { processEvent } = require('../garageDoorControlSM2');
const { test, assert } = require('./common');
const users = require('../user');

const { log } = console;

(async () => {
    try {

        async function resetUser(phone){
            await users.deleteUserByPhone(phone);
        }

        log('Starting integration tests');

        test('Process door open', async () => {

            const user_id = '123456789';
            const apiKey = 'API-KEY' + user_id;

            await resetUser(user_id);

            //setup
            var u = await users.createUser(user_id, 
                            apiKey, 
                            [{ name: 'left', controllerId: 'USER-CTRL-1', status: 'closed' }]);
        
            log(u);

            var user = await users.getUserByPhone(user_id);
            var result = await processCommand(user, 'open left');
            assert('Request to open door left received.', result.msg, "Open left command");
            assert('opening_request', result.newState, "Status after opening left");

            //Simualtes API call
            user = await users.getUserByKey(apiKey);
            //log(user);
            
            var door = user.doors.find(d => d.name === 'left');
            assert('opening_request', door.status, "Status after opening left");

            //Simulate event from controller
            result = await processEvent('ctrl_moving', door);
            result = await users.updateUserDoorStatus(user, result);
            //log(result);
            
            user = await users.getUserByPhone(user_id);
            door = user.doors.find(d => d.name === 'left');
            assert('opening', door.status, "Status after opening request is acknowledged");

            result = await processEvent('ctrl_open', door);
            result = await users.updateUserDoorStatus(user, result);
            
            user = await users.getUserByPhone(user_id);
            door = user.doors.find(d => d.name === 'left');
            assert('open', door.status, "Status after opening left");
        });

        test('Door moves on its own. Rejects sms command', async () => {

            const user_id = 'B12334';
            const apiKey = 'API-KEY' + user_id;

            await resetUser(user_id);
        
            //setup
            var u = await users.createUser(user_id, 
                            apiKey, 
                            [{ name: 'left', controllerId: 'USER-CTRL-1', status: 'closed' }]);
        
            //Simulate EVENT from controller
            user = await users.getUserByKey(apiKey);
            var result = await processEvent('ctrl_moving', user.doors[0]);
            assert('opening', result.newState, "Door is opening");
            users.updateUserDoorStatus(user, result);

            var user = await users.getUserByPhone(user_id);
            var door = user.doors.find(d => d.name === 'left');
            assert('opening', door.status, "Door is opening");

            //Simulate SMS command
            result = await processCommand(user, 'open left');
            assert('The door "left" is currently opening.', result.msg, "Open left command rejected");
            assert(result.previousState, result.newState, "Status doesn't change");

            //Simulate EVENT: close from controller
            user = await users.getUserByKey(apiKey);
            var result = await processEvent('ctrl_closed', user.doors[0]);
            assert('closed', result.newState, "Door is closed");
            users.updateUserDoorStatus(user, result);
            var user = await users.getUserByPhone(user_id);
            var door = user.doors.find(d => d.name === 'left');
            assert('closed', door.status, "Door is closed");
        });
    } catch (error) {
        log(error);
    }
})();