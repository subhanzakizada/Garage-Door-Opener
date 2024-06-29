async function openDoor(event) {
    console.log('Opening the door...');

    return `The door ${event.door.name} has finished opening.`;
}

async function closeDoor(event) {
    console.log('Closing the door...');

    return `The door ${event.door.name} has finished closing.`;
}

async function ignoreEvent(event){
    console.log('Ignoring event', event);

    return `Ignoring event. The door ${event.door.name} is currently ${event.door.status}.`;
}

async function notifyClose(event){
    console.log('Door closed', event);

    return `The door ${event.door.name} is now closed.`;
}

async function notifyOpen(event){
    console.log('Door opened', event);

    return `The door ${event.door.name} is now open.`;
}

const stateMachine = {
    open: [
    'close', 'closing', closeDoor,
    'any','open',ignoreEvent
    ],
    closing: [
    'close_complete','closed',notifyClose,
    'any',  'closing',ignoreEvent
    ],
    closed: [
    'open', 'opening',openDoor,
        'any','closed',ignoreEvent
    ],
    opening: [
    'open_complete', 'open',    notifyOpen,
    'any',  'opening', ignoreEvent
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

async function processEvent(eventName, door) {
    const event = {
        name: eventName,
        door: door,
    };

    const currentState = stateMachine[event.door.status];

    if(!currentState){
        throw new Error("Invalid state");
    }

    for(x=0; x<currentState.length/3; x++){
        if(eventName===currentState[x*3] || currentState[x*3] === 'any'){
            await currentState[(x*3)+2](event);
            event.door.status = currentState[(x*3)+1];
            // console.log( "Processed" ) ;
            break;
        }
    }
    return event.door;
}

module.exports = { processEvent };