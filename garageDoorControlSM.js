
async function openDoor(event) {
    console.log('Opening the door...', event);

    // console.log('The door is now open.');
    // Automatically notify the user about the door status
    // await notifyOpen(event);
    // Return the completion message
    return `The door ${event.door.name} has finished opening.`;
}

async function closeDoor(event) {
    console.log('Closing the door...');

    // Simulate a 5-second delay
    // await new Promise(resolve => setTimeout(resolve, 5000));

    // console.log('The door is now closed.', event);
    // Automatically notify the user about the door status
    // await notifyClose(event);
    // Return the completion message
    return `The door ${event.door.name} has finished closing.`;
}

async function ignoreEvent(event) {
    console.log(`Ignoring event. The door ${event.door.name} is currently ${event.door.status}.`, event);
    return `Ignoring event. The door ${event.door.name} is currently ${event.door.status}.`;
}

async function notifyClose(event) {
    console.log('Door closed', event);
    // Send notification to the user
    return `The door ${event.door.name} is now closed.`;
}

async function notifyOpen(event) {
    console.log('Door opened', event);
    // Send notification to the user
    return `The door ${event.door.name} is now open.`;
}

const stateMachine = {
    open: [
        'close', 'closing', closeDoor,
        'any', 'open', ignoreEvent
    ],
    closing: [
        'close_complete', 'closed', notifyClose,
        'any', 'closing', ignoreEvent
    ],
    closed: [
        'open', 'opening', openDoor,
        'any', 'closed', ignoreEvent
    ],
    opening: [
        'open_complete', 'open', notifyOpen,
        'any', 'opening', ignoreEvent
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

    // open/opening/closed/closing
    const currentState = stateMachine[event.door.status];
    console.log("The current state variable is: ")
    if (!currentState) {
        throw new Error("Invalid state");
    }
    // 5 (close) / 3 = 1.6

    for (let x = 0; x < currentState.length / 3; x++) {
        if (eventName === currentState[x * 3] || currentState[x * 3] === 'any') {
            const result = await currentState[(x * 3) + 2](event);
            event.door.status = currentState[(x * 3) + 1];
            return result;
        }
    }
}

module.exports = { processEvent };

