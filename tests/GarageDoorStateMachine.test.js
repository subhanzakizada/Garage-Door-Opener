require('dotenv').config();

const garageDoorSM_old = require('../garageDoorControlSM');
const garageDoorSM = require('../garageDoorControlSM2');
const { test, assert } = require('./common');

(async () => {
    test('SM is valid', async () => {
        const ret = garageDoorSM.validateStateMachine();
        assert(ret, true, "SM is valid");
    });
})();

//Print markdown for FSM
(async () => {
    test('Prints FSM in markdown', async () => {
        garageDoorSM.printMarkdown();
        assert(true, true, "SM is valid");
    });
})();

(async () => {

    test('No door throws exception', async () => {
        try{
            await garageDoorSM.processEvent('open');
        } catch(e){
            assert("Error: No door", e.toString());    
        }
    });

    test('No event throws exception', async () => {
        try{
            await garageDoorSM.processEvent(null, {});
        } catch(e){
            assert("Error: No event", e.toString());    
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
        
        var result = await garageDoorSM.processEvent('sms_open', door);

        assert('opening_request', result.newState, "Open requested");
        assert('Request to open door left received.', result.msg, "Msg the door is opening");     

        //Ignored
        door.status = 'opening_request';
        result = await garageDoorSM.processEvent('sms_open', door);
        assert(result.newState, result.previousState, "Status is the same as before");
        assert('opening_request', result.newState, "Status doesn't change");
    });

    test('Door in opening returns to closed if controller reports closed', async () => {
        var door = { 
            name: "left", 
            status: "opening" 
        };
        
        var result = await garageDoorSM.processEvent('ctrl_closed', door);

        assert('closed', result.newState, "closed by controller");
    });

    test('Test full cycle for a door', async () => {
        var door = { 
                        name: "left", 
                        status: "closed" 
                    };

        //Open
        var result = await garageDoorSM.processEvent('sms_open', door);
        assert('opening_request', result.newState, "New status is requested opening");
        door.status = result.newState;

        result = await garageDoorSM.processEvent('ctrl_opening', door);
        assert('opening', result.newState, "New status is opening");
        door.status = result.newState;

        result = await garageDoorSM.processEvent('ctrl_open', door);
        assert('open',result.newState, "New status is open");
        door.status = result.newState;

        //Close
        result = await garageDoorSM.processEvent('sms_close', door);
        assert('closing_request',result.newState, "New status is requested close");
        door.status = result.newState;

        result = await garageDoorSM.processEvent('ctrl_closing', door);
        assert('closing', result.newState, "Door is closing");
        door.status = result.newState;

        result = await garageDoorSM.processEvent('ctrl_closed', door);
        assert('closed', result.newState, "Door is closed");
    });

    test('Completion of close notifies user', async () => {
        var door = { 
            name: "left", 
            status: "closing" 
        };
        
        var notifier = {
            notify: async (door, msg) => {
                assert('The door left is now closed.', msg, "Notify user door is closed");
            }
        };

        var result = await garageDoorSM.processEvent('ctrl_closed', door, notifier);
        assert('closed', result.newState, "Door is closed");
    });

    test('Completion of open notifies user', async () => {
        var door = { 
            name: "left", 
            status: "opening" 
        };
        
        var notifier = {
            notify: async (door, msg) => {
                assert('The door left is now open.', msg, "Notify user door is open");
            }
        };

        var result = await garageDoorSM.processEvent('ctrl_open', door, notifier);
        assert('open', result.newState, "Door is open");
    });

    test('Open request can be canceled', async () => {
        var door = { 
            name: "left", 
            status: "opening_request" 
        };

        var result = await garageDoorSM.processEvent('sms_cancel', door);
        assert('closed', result.newState, "Door is back to closed");
    });

    test('Closed door changes to open when controller reports open', async () => {
        var door = { 
            name: "left", 
            status: "closed" 
        };

        var result = await garageDoorSM.processEvent('ctrl_open', door);
        assert('open', result.newState, "Door is open");
    });

    test('Open door changes to close when controller reports close', async () => {
        var door = { 
            name: "left", 
            status: "open" 
        };

        var result = await garageDoorSM.processEvent('ctrl_closed', door);
        assert('closed', result.newState, "Door is closed");
    });
})();