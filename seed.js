require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const users = [
    { phone: "1234567", doors: [{ name: "left", status: "open" }, { name: "right", status: "closed" }] },
    { phone: "7654321", doors: [{ name: "main", status: "closed" }] },
    { phone: "+12532937820", doors: [{ name: "main", status: "closed" }, { name: "left", status: "closed" }, { name: "right", status: "closed" }] }
];

async function seedDatabase() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db();
        const collection = database.collection('users');

        await collection.deleteMany({}); // Clear existing data
        await collection.insertMany(users);
        console.log('Mock user data inserted');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    } finally {
        await client.close();
    }
}

seedDatabase();
