require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

let dbClient;
  
async function connect() {
    try {
        dbClient = new MongoClient(uri);
        await dbClient.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

connect();

// Mock user data
const users = {
    "1234567": { phone: "1234567", doors: [{ name: "left", status: "open" }, { name: "right", status: "closed" }] },
    "7654321": { phone: "7654321", doors: [{ name: "main", status: "closed" }] },
    "+12532937820" : { phone: "+12532937820", doors: [ {name: "main", status: "closed"}, {name: "left", status: "closed"}, {name: "right", status: "closed"} ] }
  };
  
  // Function to get user by phone number
  async function getUser(phone) {
      try {
          const user = await dbClient.db().collection('users').findOne({ phone });
          return user;
      } catch (error) {
          console.error('Error fetching user:', error);
          return null;
      }
  }
  
  module.exports = { getUser };
  