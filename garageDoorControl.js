const { getUser } = require('./user');

// Action handlers
const open = async (door) => {
  door.status = 'open';
  return `Opening ${door.name}...`;
};

const close = async (door) => {
  door.status = 'closed';
  return `Closing ${door.name}...`;
};

const status = async (door) => {
  return `Status of ${door.name}: ${door.status}`;
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
    expectedArguments: 1,
    aliases: ['status', 's', 'stat', 'stauts'],
    handler: status,
    help: "Use this command to get the status of the door. If you only have one door, no arguments are needed. If you have multiple, the door name or number is required. Example: 'status main' or 's 3'"
  },
  {
    action: 'help',
    expectedArguments: 0,
    aliases: ['help', 'h', 'hlp', 'hepl'],
    handler: (argument) => {
      const action = actions.find(a => a.aliases.includes(argument));
      return action ? `${action.action}: ${action.help}` : "Help topic not found.";
    },
    help: "Use this command to get help. Example: 'help open' or 'h o'"
  }
];

// Function to parse and validate commands
async function parseCommand(command, phone) {
  if (!command) {
    return actions.map(action => `${action.action}: ${action.help}`).join('\n');
  }

  // Convert the command to lowercase and trim whitespace
  command = command.toLowerCase().trim();

  // Split the command into parts
  const parts = command.split(" ");
  const actionWord = parts[0];
  const argument = parts.slice(1).join(' ');

  // Find the matching action
  const action = actions.find(action => action.aliases.includes(actionWord));
  if (!action) {
    return "Invalid command. Supported commands are 'open', 'close', 'status', and 'help'.";
  }

  // Check if the correct number of arguments are provided
  if (parts.length - 1 < action.expectedArguments) {
    return `Invalid command format. ${action.help}`;
  }

  // If the action is 'help', handle it directly
  if (action.action === 'help') {
    return action.handler(argument);
  }

  // Retrieve user data
  const user = await getUser(phone);
  if (!user) {
    return `User with phone number ${phone} not found.`;
  }

  // Find the door
  const door = user.doors.find(door => door.name === argument || door.number === parseInt(argument, 10));
  if (!door) {
    return `Door '${argument}' not found. Available doors are: ${user.doors.map(door => door.name).join(", ")}.`;
  }

  // Execute the action handler
  return action.handler(door);
}

module.exports = { parseCommand };
