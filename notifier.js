require('dotenv').config();

const { getUserByControllerId, updateUserDoorStatus } = require('./user');
const twilio = require('twilio');
const logger = require('./logger');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

exports.notify = async (door, msg) => {
    try {
        // Find the user this door belongs to
        const user = await getUserByControllerId(door.controllerId);
        if (!user) {
            throw new Error(`User not found for controller ID: ${door.controllerId}`);
        }

        // Send SMS to the user's phone using Twilio API
        const message = await client.messages.create({
            body: msg,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone,
        });

        logger.info(`Message sent to ${user.phone}: ${msg}`);

        // Update the user's door status if the status has changed
        if (door.previousStatus !== door.newStatus) {
            await updateUserDoorStatus(user.userId, door.name, door.newStatus);
        }

        return message;
    } catch (error) {
        logger.error('Error in notify:', error);
        throw error;
    }
};

