const garageDoorSM = require('../garageDoorControlSM');
const { test, assert } = require('./common');

(async () => {

    test('No door throws exception', async () => {
        try{
            await garageDoorSM.processEvent('open');
        } catch(e){
            assert("Error: No door", e.toString());    
        }
    });

    test('Door with invalid state throws exception', async () => {
        try{
            await garageDoorSM.processEvent('open', { status: "foo" });
        } catch(e){
            assert("Error: Invalid state", e.toString());    
        }
    });

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

    test('Completion notifies user', async () => {
        var door = { 
            name: "left", 
            status: "closing" 
        };
        
        var notifier = {
            notify: async (door, msg) => {
                assert('The door left is now closed.', msg, "Notify user door is closed");
            }
        };

        var result = await garageDoorSM.processEvent('close_complete', door, notifier);
        assert('closed', result.newState, "Door is closed");
    });
})();