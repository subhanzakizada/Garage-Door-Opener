const garageDoorSM = require('../garageDoorControlSM');
  
// Test runner function
function test(description, fn) {
    try {
      fn();
      console.log(`✔️  ${description}`);
    } catch (error) {
      console.error(`❌  ${description}`);
      console.error(error);
    }
}

// Basic assertion function for testing
function assert(condition, message) {
    if(!condition){
      throw new Error(message || "Assertion failed");
    }
}

(async () => {
    test('Test opening the door', async () => {
        const user = {
            doors: {
                left: {
                    status: 'closed'
                }
            }
        };
        console.log(user);
        await garageDoorSM.processEvent('open', 'left', user);
        console.log(user);
        assert(user.doors.left.status==='opening', "Door is opening");

        //ignored
        await garageDoorSM.processEvent('open', 'left', user);
    });
})();