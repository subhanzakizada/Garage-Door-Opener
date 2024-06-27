async function openDoor() {
    console.log('Opening the door...');
}
    
async function closeDoor() {
    console.log('Closing the door...');
}
    
async function ignoreEvent(event){
    console.log('Ignoring event', event);
}
    
async function notifyClose(event){
    console.log('Door closed', event);
}
    
async function notifyOpen(event){
    console.log('Door opened', event);
}
    
const stateMachine = {
    open: [
    'close', 'closing', closeDoor,
    'any','open',ignoreEvent
    ],
    closing: [
    'close_complete','closed',notifyClose,
    'any','closing',ignoreEvent
    ],
    closed: [
    'open', 'opening',openDoor,
    'any','closed',ignoreEvent
    ],
    opening: [
    'open_complete', 'open',notifyOpen,
    'any','opening', ignoreEvent
    ]
};

/*
    The event object has the following structure:

    event = {
        name: 'open|close|open_complete|close_complete',
        door: 'a identifier',
        user: {} //the current users
    }
*/
async function processEvent(eventName, doorIdentifier, user) {
    const event = {
        name: eventName,
        user: user,
        door: user.doors.find(d => d.name === doorIdentifier)
    };
    const door = user.doors.find(d => d.name === doorIdentifier)
    // console.log("The user is :: " + user)
    // console.log("The user doors are :: " + user.doors)

    // for(let i = 0; user.doors.length > i; i++) {
    //     console.log('USER DOORS: ')
    // }

    // console.log('\n\n')
    // console.log("The door identifier is :: " + doorIdentifier)
    console.log('THE USER doors[door] is ' + door.status)

    // open/opening/closed/closing
    const currentState = stateMachine[door.status];
    
    // console.log("The current state is :: " + currentState)

    if(!currentState){
        throw new Error("Invalid state");
    }
    
    for(x=0; x<currentState.length/3; x++){
        if(eventName===currentState[x*3] || currentState[x*3] === 'any'){
            await currentState[(x*3)+2](event);
            user.doors[doorIdentifier].status = currentState[(x*3)+1];
            return "Processed";
        }
    }
}
    
module.exports = { processEvent };