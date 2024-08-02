const logger = require('./logger');

async function openDoor(event) {
    return `Request to open door ${event.door.name} received.`;
}

async function closeDoor(event) {
    return `Request to close door ${event.door.name} received.`;
}

async function ignoreEvent(event){
    logger.info(`SM: ignoring event: ${event.name}. Door in state: ${event.door.status}`);
    return `The door "${event.door.name}" is currently ${event.door.status}.`;
}

// Generic notification function
async function notify(event, statusMessage) {
    if(event.notifier){
        await event.notifier.notify(event.door, statusMessage);
    }
    return statusMessage;
}

// Simplified notifyClose function
async function notifyClosed(event) {
    const msg = `The door ${event.door.name} is now closed.`;
    return await notify(event, msg);
}

// Simplified notifyOpen function
async function notifyOpen(event) {
    const msg = `The door ${event.door.name} is now open.`;
    return await notify(event, msg);
}

// Simplified notifyOpen function
async function notifyOpening(event) {
    const msg = `The door ${event.door.name} is now opening.`;
    return await notify(event, msg);
}

// Simplified notifyOpen function
async function notifyClosing(event) {
    const msg = `The door ${event.door.name} is now closing.`;
    return await notify(event, msg);
}

// Simplified notifyOpen function
async function notifyCancel(event) {
    const msg = `The door ${event.door.name} operation is cancelled.`;
    return await notify(event, msg);
}

async function logInvalid(event){
    logger.info(`Door in invalid state: ${event.door.status}`);
    return `Controller reports door "${event.door.name}" in invalid state.`;
}

async function noOp(event){
    logger.info(`NoOp: door in state: ${event.door.status}. Eventname: ${event.name}`);
    return "";
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
    closed: [
        'sms_open',     'opening_request', openDoor,
        'ctrl_open',    'open',            noOp,
        'ctrl_moving',  'opening',         noOp,    //We assume 'moving' is opening
        'ctrl_opening', 'opening',         noOp,
        'ctrl_invalid', 'closed',          logInvalid,
        'any',          'closed',          ignoreEvent
    ],
    opening_request: [
        'sms_cancel',   'closed',          notifyCancel,
        'ctrl_invalid', 'closed',          logInvalid,
        'ctrl_moving',  'opening',         notifyOpening,    //We assume 'moving' is opening
        'ctrl_opening', 'opening',         notifyOpening,
        'any',          'opening_request', ignoreEvent

    ],
    opening: [
        'ctrl_open',    'open',    notifyOpen,
        'ctrl_closed',  'closed',  notifyClosed,
        'ctrl_invalid', 'closed',  logInvalid,
        'any',          'opening', ignoreEvent
    ],
    open: [
        'sms_close',   'closing_request', closeDoor,
        'ctrl_moving', 'closing',         noOp,     //We assume 'moving' is closing
        'ctrl_closed', 'closed',          noOp,
        'ctrl_invalid','closed',          logInvalid,
        'any',         'open',            ignoreEvent
    ],
    closing_request: [
        'sms_cancel',   'open',            notifyCancel,
        'ctrl_moving',  'closing',         noOp,        //We assume 'moving' is closing
        'ctrl_closing', 'closing',         notifyClosing,
        'ctrl_invalid', 'closed',          logInvalid,
        'any',          'closing_request', ignoreEvent
    ],
    closing: [
        'ctrl_closed', 'closed',  notifyClosed,
        'ctrl_open',   'open',    notifyOpen,
        'ctrl_invalid','closed',  logInvalid,
        'any',         'opening', ignoreEvent
    ]
};

function validateStateMachine(){

    const validEvents = ['sms_open', 'sms_close', 'sms_cancel',
                         'ctrl_open', 'ctrl_opening', 'ctrl_closed', 'ctrl_closing',
                         'ctrl_invalid', 'ctrl_moving',
                         'any'];

    //Check that all states have valid states
    for(const state in stateMachine){
        if(stateMachine[state].length % 3 !== 0){
            throw new Error(`State ${state} has an invalid number of elements`);
        }

        for(x=0; x<stateMachine[state].length/3; x++){
            const eventName = stateMachine[state][x*3];

            if(!validEvents.includes(eventName)){
                throw new Error(`State ${state} has an invalid event: ${eventName}`);
            }

            const next = stateMachine[state][x*3+1];
            if(!Object.keys(stateMachine).includes(next)){
                throw new Error(`State ${state} has an invalid next state: ${next}`);
            }
        }
    }
}

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

    if(!door){
      throw new Error("No door");
    }

    if(!eventName){
      throw new Error("No event");
    }

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
                // Log the Error
                logger.error(`Error processing event '${eventName}': ${error.message}`);
                throw error;
            }
        }
    }

    // Should never get here because all states have an "any" event. So all events should be handled.
    return null;
}

module.exports = { processEvent, validateStateMachine };