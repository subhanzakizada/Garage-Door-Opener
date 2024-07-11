async function openDoor(event) {
    console.log('Opening the door...');
    return `The door ${event.door.name} is opening.`;
}

async function closeDoor(event) {
    console.log('Closing the door...');
    return `The door ${event.door.name} is closing.`;
}

async function ignoreEvent(event){
    console.log('Ignoring event', event);
    return `The door "${event.door.name}" is currently ${event.door.status}.`;
}

//These 2 methods need a "notifier" system to send a message to the user
//ToDo: simplify these 2 methods and make a generic one
async function notifyClose(event){
    console.log('Door closed', event);
    const msg = `The door ${event.door.name} is now closed.`;
    if(event.notifier){
        await event.notifier.notify(event.door, msg);
    }
    return msg;
}

async function notifyOpen(event){
    console.log('Door opened', event);
    const msg = `The door ${event.door.name} is now open.`;
    if(event.notifier){
        await event.notifier.notify(event.door, msg);
    }
    return msg;
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
        'open', 'opening',  openDoor,
        'any','closed',     ignoreEvent
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
        door: {} // the door object to be processed,
    }

    The state machine returns the new door object with the updated status and a message.
*/  

async function processEvent(eventName, door, notifier) {
    const event = {
        name: eventName,
        door: door,
        notifier: notifier
    };

    const currentState = stateMachine[event.door.status];

    if(!currentState){
        throw new Error("Invalid state");
    }

    for(x=0; x<currentState.length/3; x++){
        if(eventName===currentState[x*3] || currentState[x*3] === 'any'){
            try {
                const result = {
                    name: door.name,
                    previousState: door.status
                };
                result.newStatus = currentState[(x*3)+1];
                result.msg = await currentState[(x*3)+2](event);
                return result;
            } catch(error){
                log(error);
                throw error;
            }
        }
    }

    //Should never get here because all states have an "any" event. So all events should be handled.
    return null;
}

module.exports = { processEvent };