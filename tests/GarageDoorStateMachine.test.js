const garageDoorSM = require('../garageDoorControlSM');
const { test, assert } = require('./common');

const { log } = console;

(async () => {

    function updateUserDoor(user, door){
        var x = user.doors.findIndex((d) => d.name === door.name);
        user.doors[x].status = door.status;
    }

    test('Test opening the door & ignore event', async () => {
        const user = {
            doors: [
                {
                    name: 'left',
                    status: 'closed'
                }
            ]
        };
        var door = await garageDoorSM.processEvent('open', user.doors[0]);
        log(user);
        updateUserDoor(user, door);
        assert(door.status==='opening', "Door is opening");

        //ignored
        door = await garageDoorSM.processEvent('open', user.doors[0]);
        assert(door.status==='opening', "Door is opening");
    });

    test('Test full cycle for a door', async () => {
        const user = { 
                doors: [
                    { 
                        name: "left", 
                        status: "closed" 
                    }
                ]
        };

        var door = await garageDoorSM.processEvent('open', user.doors[0]);
        // updateUserDoor(user, door);
        assert(user.doors[0].status==='opening', "Door is opening");

        door = await garageDoorSM.processEvent('open_complete', user.doors[0]);
        // updateUserDoor(user, door);
        assert(door.status==='open', "Door is open");

        door = await garageDoorSM.processEvent('close', user.doors[0]);
        // updateUserDoor(user, door);
        assert(door.status==='closing', "Door is closing");

        door = await garageDoorSM.processEvent('close_complete', user.doors[0]);
        // updateUserDoor(user, door);
        assert(door.status==='closed', "Door is closed");
    });
})();