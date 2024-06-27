let operationInProgress = {};  // To track the doors being operated on

async function openDoor(event) {
    console.log('Opening the door...');
    operationInProgress[event.door.name] = true;  // Mark door as operating

    // Simulate a 5-second delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('The door is now open.', event);
    operationInProgress[event.door.name] = false;  // Mark door as done
    // Automatically notify the user about the door status
    await notifyOpen(event);
    // Return the completion message
    return `The door ${event.door.name} has finished opening.`;
}

async function closeDoor(event) {
    console.log('Closing the door...');
    operationInProgress[event.door.name] = true;  // Mark door as operating

    // Simulate a 5-second delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('The door is now closed.', event);
    operationInProgress[event.door.name] = false;  // Mark door as done
    // Automatically notify the user about the door status
    await notifyClose(event);
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

    if (operationInProgress[doorIdentifier]) {
        return await ignoreEvent(event);
    }

    // open/opening/closed/closing
    const currentState = stateMachine[event.door.status];
    
    if (!currentState) {
        throw new Error("Invalid state");
    }
    
    for (let x = 0; x < currentState.length / 3; x++) {
        if (eventName === currentState[x * 3] || currentState[x * 3] === 'any') {
            const result = await currentState[(x * 3) + 2](event);
            event.door.status = currentState[(x * 3) + 1];
            return result;
        }
    }
}

module.exports = { processEvent };

