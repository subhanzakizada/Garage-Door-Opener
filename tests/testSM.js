const sm = require('../garageDoorControlSM');

const user = { phone: "+12532937820", doors: [{ name: "main", status: "closed" }, { name: "left", status: "closed" }, { name: "right", status: "closed" }] };

function updateUserDoorStatus(doorIdentifier, status){
    var x = user.doors.findIndex((d) => d.name === doorIdentifier);
    user.doors[x].status = status;
}

(async () => {
    var nextState = await sm.processEvent('open', "left", user);
    console.log(nextState);
    updateUserDoorStatus("left", nextState);

    nextState = await sm.processEvent('open', "left", user);
    updateUserDoorStatus("left", nextState);
    console.log(nextState);
    
    nextState = await sm.processEvent('open_complete', "left", user);
    updateUserDoorStatus("left", nextState);
    console.log(nextState);

})();

