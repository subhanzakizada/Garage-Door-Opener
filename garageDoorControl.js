const { getUser } = require('./user');

// Function to parse and validate commands
async function parseCommand(command, phone) {
  // Convert the command to lowercase and trim whitespace
  command = command.toLowerCase().trim();

  // Split the command into parts
  const parts = command.split(" ");

  // Ensure we have at least two parts (command and door identifier)
  if (parts.length < 2) {
    return "Invalid command format. Please use commands like 'open left', 'close right', or 'status main'.";
  }

  // Define the command actions
  const actions = {
    open: "open",
    o: "open",
    close: "close",
    c: "close",
    status: "status",
    s: "status"
  };

  const action = actions[parts[0]];
  if (!action) {
    return "Invalid command. Supported commands are 'open', 'close', and 'status'.";
  }

  const doorName = parts[1];

  // Retrieve user data
  const user = await getUser(phone);
  if (!user) {
    return `User with phone number ${phone} not found.`;
  }

  // Find the door
  const door = user.doors.find(door => door.name === doorName);
  if (!door) {
    return `Door '${doorName}' not found. Available doors are: ${user.doors.map(door => door.name).join(", ")}.`;
  }

  // Formulate the response based on the action
  switch (action) {
    case "open":
      door.status = "open";
      return `Opening ${doorName}...`;
    case "close":
      door.status = "closed";
      return `Closing ${doorName}...`;
    case "status":
      return `Status of ${doorName}: ${door.status}`;
  }
}

module.exports = { parseCommand };
