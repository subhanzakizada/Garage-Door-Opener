require('dotenv').config();
const { MongoClient } = require('mongodb');
const { parseCommand } = require('./garageDoorControl');

const uri = process.env.MONGODB_URI;

const users = [
    { phone: "1234567", doors: [{ name: "left", status: "open" }, { name: "right", status: "closed" }] },
    { phone: "7654321", doors: [{ name: "main", status: "closed" }] },
    { phone: "+12532937820", doors: [{ name: "main", status: "closed" }, { name: "left", status: "closed" }, { name: "right", status: "closed" }] }
];

async function seedDatabase() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        // Add this line to log the database name
        const database = client.db();
        console.log('Using database:', database.databaseName);

        const collection = database.collection('users');

        console.log('Clearing existing data');
        await collection.deleteMany({}); // Clear existing data

        console.log('Inserting new data');
        await collection.insertMany(users);
        console.log('Mock user data inserted');

        await collection.insertOne({ name: 'John Doe', age: 30 });
    } catch (error) {
        console.error('MongoDB connection error:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

let dbClient;

async function connectToMongoDB() {
    if (!dbClient) {
        try {
            dbClient = new MongoClient(uri);
            await dbClient.connect();
            console.log('Connected to MongoDB');

            const database = dbClient.db(); 
            console.log('Using database:', database.databaseName);

        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }
}

async function checkDb() {
    try {
        // Ensure MongoDB connection is established
        await connectToMongoDB();

        // Specify the database and collection
        const database = dbClient.db(); // Replace with your database name
        console.log('Using database:', database.databaseName); // Add this line to log the database name
        const collection = database.collection('users'); // Replace with your collection name

        // Query the collection
        const users = await collection.find({}).toArray();

        // Log the results
        console.log('Users:', users);

    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
    } finally {
        // Close the connection
        await dbClient.close();
        dbClient = null;
    }
}

// seedDatabase().then(() => {
//     checkDb();
// });


// (async () => {
//     const data = await parseCommand('Close left', '+12532937820');
//     console.log(data);
// })();


(async () => {
//     const data = await parseCommand('Close left', '+12532937820');
//     console.log(data);
    checkDb();
})();