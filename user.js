require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
let dbClient;

async function connectToMongoDB() {
    if (!dbClient) {
        try {
            dbClient = new MongoClient(uri);
            await dbClient.connect();
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }
}

// Ensure MongoDB connection is established
connectToMongoDB();

// Function to get user by phone number
async function getUser(phone) {
    try {
        const database = dbClient.db();
        const collection = database.collection('users');
        const user = await collection.findOne({ phone });
        console.log("the phone number is: " + phone);
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

module.exports = { getUser };


  
  