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

/*
    State machine representation:

    Every property is a "state"
    Each state has an array of 3 elements:
        - the expected event
        - the state to which it transitions when the event happens
        - the action to be executed as part of this transition
    
    Any given state can have many matching events, so the array will always have muliples of 3 elements total.
*/
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
        notifier: {} // the notifier object to send messages (used only for open_complete and close_complete events because these events are sent by the controller)
    }

    The state machine returns:
        - The door "previous" state
        - The door "new" state (if changed)
        - A message

        New and previous can be used to determine if the door status changed and if the user should be updated 
*/  

async function processEvent(eventName, door, notifier) {
    const event = {
        name: eventName,        //Open/Close/State/Complete
        door: door,             //The door object
        notifier: notifier      //An (optional and not always used) notifier object
    };

    const currentState = stateMachine[event.door.status];

    if(!currentState){
        throw new Error("Invalid state");   //This should never happen
    }

    for(x=0; x<currentState.length/3; x++){
        if(eventName===currentState[x*3] || currentState[x*3] === 'any'){
            //Found a matching event for the state OR "any"
            try {
                const result = {
                    name: door.name,
                    previousState: door.status
                };
                result.newState = currentState[(x*3)+1];
                result.msg = await currentState[(x*3)+2](event);
                return result;
            } catch(error){
                //ToDo: log error other than console
                log(error);
                throw error;
            }
        }
    }

    //Should never get here because all states have an "any" event. So all events should be handled.
    return null;
}

module.exports = { processEvent };