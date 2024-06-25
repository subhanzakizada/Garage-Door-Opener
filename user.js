const { MongoClient } = require('mongodb');
<<<<<<< HEAD

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
=======
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

>>>>>>> 14dfdd332f7d96a6472d1ebcaf8616c0c1969e77
async function getUser(phone) {
    try {
        await client.connect();
        const database = client.db();
        const collection = database.collection('users');
<<<<<<< HEAD
        const user = await collection.findOne({ phone });
        console.log("the phone number is: " + phone);
=======
        const user = await collection.findOne({ phone: phone });
>>>>>>> 14dfdd332f7d96a6472d1ebcaf8616c0c1969e77
        return user;
    } catch (error) {
        console.error('Error retrieving user:', error);
        return null;
    } finally {
        await client.close();
    }
}

async function updateUser(phone, doorName, status) {
  try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const database = client.db();
      const collection = database.collection('users');

      const result = await collection.updateOne(
        { phone: phone }, // Using phone as the selector
        { $set: { [`doors.$[door].status`]: status } },
        { arrayFilters: [{ 'door.name': doorName }] }
    );

  } catch (error) {
      console.error('Error updating door status:', error);
  } finally {
      // Close the client connection
      if (client) {
          await client.close();
      }
  }
}

module.exports = { getUser, updateUser };


  
  