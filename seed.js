require('dotenv').config();
const { MongoClient } = require('mongodb');
const { parseCommand } = require('./garageDoorControl');
const logger = require('./logger');

const uri = process.env.MONGODB_URI;

const users = [
    { phone: "1234567", doors: [{ name: "left", status: "open" }, { name: "right", status: "closed" }] },
    { phone: "7654321", doors: [{ name: "main", status: "closed" }] },
    { phone: "+12532937820", doors: [{ name: "main", status: "closed" }, { name: "left", status: "open" }, { name: "right", status: "closed" }] }
];

async function seedDatabase() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        logger.info('Connected to MongoDB');

        // Add this line to log the database name
        const database = client.db();
        logger.info(`Using database: ${database.databaseName}`);

        const collection = database.collection('users');

        logger.info('Clearing existing data');
        await collection.deleteMany({}); // Clear existing data

        logger.info('Inserting new data');
        await collection.insertMany(users);

        logger.info('Mock user data inserted');
        await collection.insertOne({ name: 'John Doe', age: 30 });
    
    } catch (error) {
        logger.error(`MongoDB connection error: ${error}`);
    } finally {
        await client.close();
        logger.info('MongoDB connection closed');
    }
}

let dbClient;

async function connectToMongoDB() {
    if (!dbClient) {
        try {
            dbClient = new MongoClient(uri);
            await dbClient.connect();
            logger.info('Connected to MongoDB');

            const database = dbClient.db(); 
            logger.info(`Using database: ${database.databaseName}`);

        } catch (error) {
            logger.error(`Error connecting to MongoDB: ${error}`);
        }
    }
}

async function checkDb() {
    try {
        // Ensure MongoDB connection is established
        await connectToMongoDB();

        // Specify the database and collection
        const database = dbClient.db(); // Replace with your database name
        logger.info(`Using database: ${database.databaseName}`); // Add this line to log the database name
        const collection = database.collection('users'); // Replace with your collection name

        // Query the collection
        const users = await collection.find({}).toArray();

        // Log the results
        logger.info(`Users: ${users}`);

    } catch (error) {
        logger.error(`Error fetching data from MongoDB: ${error}`);
    
    } finally {
        // Close the connection
        await dbClient.close();
        dbClient = null;
        logger.info('MongoDB connection closed');
    }
}