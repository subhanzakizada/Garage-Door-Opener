const sm = require('../garageDoorControlSM')

const user = { phone: "+12532937820", doors: [{ name: "main", status: "closed" }, { name: "left", status: "closed" }, { name: "right", status: "closed" }] };

// { name: "left", status: "closed" }
let door = user.doors[1]; // left door by reference

function updateUserDoorStatus(doorIdentifier, status){
    var x = user.doors.findIndex((d) => d.name === doorIdentifier);
    user.doors[x].status = status;
}

(async () => {
    door = await sm.processEvent('open', door);
    console.log(door);console.log('\n'); // expecting 

    door = await sm.processEvent('close', door);
    console.log(door);console.log('\n');

    door = await sm.processEvent('open_complete', door);
    console.log(door);console.log('\n');

    console.log(user.doors[1])
    console.log(door)

})();