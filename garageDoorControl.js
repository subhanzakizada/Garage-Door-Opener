// Just a test async function that will be replaced with the real data we will use
async function getUser(userId) {
    const users = {
      1: { id: 1, name: "John Doe", numberOfDoors: 2 }, // User with 2 garage doors
      2: { id: 2, name: "Jane Smith", numberOfDoors: 1 }, // User with 1 garage door
    };
  
    return users[userId];
  }
  


  /*
    Works with commands like : "Open 2", "open 2", "o 2", "C 2", "s 1" 
    I'm thinking implementing it in a way if the user inputs "oepn", instead of opening, we can send a message
    such as "Please enter a valid command such as: open, close or status" would be better? 
  */

  // Function to parse and validate commands
  async function parseCommand(command, userId) {
    // Convert the command to lowercase and trim whitespace
    command = command.toLowerCase().trim();
  
    // Split the command into parts
    const parts = command.split(" ");
  
    // Ensure we have at least two parts (command and door number)
    if (parts.length < 2) {
      return "Invalid command format. Please use commands like 'open 1', 'close 2', or 'status 1'.";
    }
  
    // Validate and normalize the command
    let action;
    switch (parts[0]) {
      case "open":
      case "o":
        action = "open";
        break;
      case "close":
      case "c":
        action = "close";
        break;
      case "status":
      case "s":
        action = "status";
        break;
      default:
        return "Invalid command. Supported commands are 'open', 'close', and 'status'.";
    }
  
    // Parse the door number
    const doorNumber = parseInt(parts[1]);
  
    // Check if door number is a valid integer
    if (isNaN(doorNumber)) {
      return "Invalid door number. Please provide a valid door number.";
    }
  
    // Retrieve user data
    const user = await getUser(userId);
  
    // Check if the door number is within the user's range of control
    if (doorNumber < 1 || doorNumber > user.numberOfDoors) {
      return `Door ${doorNumber} is out of range. Your user account can control doors 1 to ${user.numberOfDoors}.`;
    }
  
    // Formulate the response based on the action
    switch (action) {
      case "open":
        return `Opening Door ${doorNumber}...`;
      case "close":
        return `Closing Door ${doorNumber}...`;
      case "status":
        return `Status of Door ${doorNumber}: Closed`; // Mocking status response
    }
  }
  
  // Test cases
  async function runTests() {
    try {
      console.log("Test 1: Valid open command");
      let result = await parseCommand("open 3", 1);
      console.log(result);
  
      console.log("\nTest 2: Valid close command");
      result = await parseCommand("close 2", 1);
      console.log(result);
  
      console.log("\nTest 3: Valid status command");
      result = await parseCommand("status 1", 1);
      console.log(result);
  
      console.log("\nTest 4: Invalid command format");
      result = await parseCommand("open", 1);
      console.log(result);
  
      console.log("\nTest 5: Invalid action");
      result = await parseCommand("start 1", 1);
      console.log(result);
  
      console.log("\nTest 6: Invalid door number");
      result = await parseCommand("open abc", 1);
      console.log(result);
  
      console.log("\nTest 7: Out of range door number");
      result = await parseCommand("open 3", 1);
      console.log(result);
  
      console.log("\nTest 8: Command normalization");
      result = await parseCommand("Open 1", 1);
      console.log(result);
      result = await parseCommand("CLOSE 2", 1);
      console.log(result);
      result = await parseCommand("s 1", 1);
      console.log(result);
  
      console.log("\nTest 9: Multiple synonyms for commands");
      result = await parseCommand("o 1", 1);
      console.log(result);
      result = await parseCommand("c 2", 1);
      console.log(result);
      result = await parseCommand("s 1", 1);
      console.log(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  // Run tests
  runTests();
  