const garageDoorSM = require('../garageDoorControlSM');
const { test, assert } = require('./common');

(async () => {

    test('Test opening the door & ignore event', async () => {
        var door = { 
            name: "left", 
            status: "closed" 
        };
        
        var result = await garageDoorSM.processEvent('open', door);

        assert('opening', result.newState, "New status is opening");
        assert('The door left is opening.', result.msg, "Msg the door is opening");
        

        //Ignored
        door.status = 'opening';
        result = await garageDoorSM.processEvent('open', door);
        assert(result.newState, result.previousState, "Status is the same as before");
        assert('opening', result.newState, "Status doesn't change");
    });

    test('Test full cycle for a door', async () => {
        var door = { 
                        name: "left", 
                        status: "closed" 
                    };

        var result = await garageDoorSM.processEvent('open', door);
        assert('opening', result.newState, "New status is opening");
        door.status = result.newState;

        result = await garageDoorSM.processEvent('open_complete', door);
        assert('open', result.newState, "New status is open");
        door.status = result.newState;

        result = await garageDoorSM.processEvent('close', door);
        assert('closing',result.newState, "New status is closing");
        door.status = result.newState;

        result = await garageDoorSM.processEvent('close_complete', door);
        assert('closed', result.newState, "Door is closed");
    });
})();