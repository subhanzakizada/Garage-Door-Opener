
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const logger = require('./logger');

//Name for the default DB
const db = process.env.DEFAULT_DB;

async function connect() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

async function createUser(phone, apiKey, doors) {
  const client = await connect();
  try {
      const database = client.db(db);
      const collection = database.collection('users');
      const user = { phone: phone, apiKey: apiKey, doors: doors };
      const result = await collection.insertOne(user);
      return result;
  } catch (error) {
      logger.error(`Error creating user: ${error}`);
      return null;
  } finally {
      await client.close();
  }
};

async function deleteUserByPhone(phone) {
  const client = await connect();
  try {
    const database = client.db(db);
    const collection = database.collection('users');
    const result = await collection.deleteMany({ phone: phone });
    //logger.info(`Deleted ${result.deletedCount} user(s)`);
    return result;
  } catch (error) {
    logger.error(`Error deleting user: ${error}`);
    return null;
  } finally {
    await client.close();
  }
}

async function getUserByPhone(phone) {
  const client = await connect();
  try {
    const database = client.db(db);
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

async function getUserByKey(key){
  const client = await connect();
  try {
    const database = client.db(db);
    const collection = database.collection("users");
    const user = await collection.findOne({ "apiKey": key });
    return user;
  } catch (error) {
      logger.error(`Error retrieving user: ${error}`);
      return null;
  } finally {
      await client.close();
  } 
}

async function getUserByControllerId(controllerId){
  const client = await connect();
  try {
    const database = client.db(db);
    const collection = database.collection("users");
    const user = await collection.findOne({ "doors.controllerId": controllerId });
    return user;
  } catch (error) {
      logger.error(`Error retrieving user: ${error}`);
      return null;
  } finally {
      await client.close();
  }
}

async function updateUserDoorStatus(user, door) {
  if(door.newState === door.previousState){
    logger.info(`Door status for ${door.name}, in user ${user.phone} has not changed`);
    return user; //No changes, do nothing
  }
  const client = await connect();
  try {
    const database = client.db(db);
    const collection = database.collection('users');
    const result = await collection.updateOne(
        { _id: user._id, "doors.name": door.name },
        { $set: { "doors.$.status": door.newState } }
    );
    console.log(result);
    return result;
  } catch (error) {
      console.error('Error updating user door status:', error);
      return null
  } finally {
      await client.close();
  }
}

module.exports = { getUserByPhone, getUserByKey, updateUserDoorStatus, getUserByControllerId, deleteUserByPhone, createUser, deleteUserByPhone};