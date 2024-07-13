
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const logger = require('./logger');

async function getUser(phone) {
    try {
        await client.connect();
        const database = client.db("GarageDoor");
        const collection = database.collection('users');
        const user = await collection.findOne({ phone: phone });
        return user;
    } catch (error) {
        logger.error(`Error retrieving user: ${error}`);
        return null;
    } finally {
        await client.close();
    }
}

async function getDoorByControllerId(controllerId){
    try {
        await client.connect();
        const database = client.db();
        const collection = database.collection();

        const user = await collection.findOne({ "doors.controllerId": controllerId });
        if (!user) {
            return null;
        }

        const door = user.doors.find(door => door.controllerId === controllerId);
        return door || null;
    } catch (error) {
        logger.error(`Error retrieving door: ${error}`);
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
    
    // Log the update result
    logger.info(`Updated user with phone ${phone}: door ${doorName} status set to ${status}`);  


  } catch (error) {
    logger.error(`Error updating door status: ${error}`);
  } finally {
      // Close the client connection
      if (client) {
          await client.close();
      }
  }
}

module.exports = { getUser, updateUser, getDoorByControllerId };


  
  