//const { error } = require('winston');
const { processEvent } = require('./garageDoorControlSM');

function findDoor(user, argument){
  // Find the door by name or number
  const door = user.doors.find(door => door.name === argument || door.number === parseInt(argument, 10));
  
  if(!door){
    throw new Error(`Door '${argument}' not found. Available doors are: ${user.doors.map(door => door.name).join(", ")}.`);
  }
  
  return door;
}

// Action handlers
const open = async (user, argument) => {
  const door = findDoor(user, argument);
  return await processEvent('open', door);
};

const close = async (user, argument) => {
  const door = findDoor(user, argument);
  return await processEvent('close', door);
};

const status = async (user, argument) => {
  // If no argument is provided, return the status of all doors
  if(!argument){
    return {
      msg: user.doors.map(door => `Door "${door.name}" is ${door.status}`).join('\n')
    }
  }

  const door = findDoor(user, argument);
  
  return {
    msg: `Status of ${door.name}: ${door.status}`
  }
};

// Define the command actions with additional metadata
const actions = [
  {
    action: 'open',
    expectedArguments: 1,
    aliases: ['open', 'o', 'op', 'ope', 'opne'],
    handler: open,
    help: "Use this command to open the door. If you only have one door, no arguments are needed. If you have multiple, the door name or number is required. Example: 'open left' or 'o 1'"
  },
  {
    action: 'close',
    expectedArguments: 1,
    aliases: ['close', 'c', 'cl', 'clos', 'clsoe'],
    handler: close,
    help: "Use this command to close the door. If you only have one door, no arguments are needed. If you have multiple, the door name or number is required. Example: 'close right' or 'c 2'"
  },
  {
    action: 'status',
    expectedArguments: 0,
    aliases: ['status', 's', 'stat', 'stauts'],
    handler: status,
    help: "Use this command to get the status of the door. If you only have one door, no arguments are needed. If you have multiple, the door name or number is required. Example: 'status main' or 's 3'"
  },
  {
    action: 'help',
    expectedArguments: 0,
    aliases: ['help', 'h', 'hlp', 'hepl'],
    handler: (user, argument) => {

      if(!argument){
        return { msg: actions.map(action => "Available commands:\n" + `${action.action}: ${action.help}`).join('\n') };
      }

      const action = actions.find(a => a.aliases.includes(argument));
      const msg = action ? `${action.action}: ${action.help}` : "Help topic not found.";
      return { msg: msg };
    },
    help: "Use this command to get help. Example: 'help open' or 'h o'"
  }
];

function errorMsg(msg){
  return { msg: msg };
}

// Function to parse and validate commands
async function parseCommand(user, command) {
  
  if(!user || typeof user !== 'object'){
    throw new Error("Invalid user");
  }

  if(!user.doors || user.doors.length === 0){
    return errorMsg('User has no doors');  
  }

  if(!command) return errorMsg("No command");
  
  command = command.toLowerCase().trim();
  const parts = command.split(" ");
  const actionWord = parts[0];
  const argument = parts.slice(1).join(' ');

  const action = actions.find(action => action.aliases.includes(actionWord));

  if(!action){
    return errorMsg(`Invalid command. Supported commands are ${actions.map(action => "'" + action.action + "'").join(", ")}.`);
  }
 
  if(parts.length - 1 < action.expectedArguments){
    return errorMsg(`Invalid command format. ${action.help}`);
  }

  const result = await action.handler(user, argument);

  return result;
}

module.exports = { parseCommand };