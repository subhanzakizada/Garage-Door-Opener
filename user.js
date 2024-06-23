require('dotenv').config();
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

let dbClient;

async function connect() {
    if (!dbClient) {
        dbClient = new MongoClient(uri);
        await dbClient.connect();
        console.log('Connected to MongoDB');
    }
}

// connect();

// Function to get user by phone number
async function getUser(phone) {
    try {
        const database = dbClient.db();
        const collection = database.collection('users');
        const user = await collection.findOne({ phone });
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

module.exports = { getUser };

  