// Mock user data
const users = {
    "1234567": { phone: "1234567", doors: [{ name: "left", status: "open" }, { name: "right", status: "closed" }] },
    "7654321": { phone: "7654321", doors: [{ name: "main", status: "closed" }] },
  };
  
// Function to get user by phone number
// Just a test async function that will be replaced with the real data we will use
  async function getUser(phone) {
    return users[phone] || null;
  }
  
  module.exports = { getUser };
  