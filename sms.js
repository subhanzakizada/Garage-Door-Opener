const express = require('express');
const server = express.Router();
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;

module.exports = server;

const { processCommand } = require('./garageDoorControl'); 
const users = require('./user');
const logger = require('./logger');


function sendSMSResponse(res, msg){
    // Generate TwiML response
    const twiml = new MessagingResponse();
    twiml.message(msg);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
}

const twilioValidator = twilio.webhook({validate: process.env.VALIDATE_TWILIO_REQUESTS === "1" ? true : false});

// Endpoint to handle incoming SMS messages from Twilio
server.post('/', twilioValidator, smsHandler);
server.get('/', twilioValidator, smsHandler);
    
async function smsHandler(req, res, next){
    
    var smsData;

    if(req.method === 'GET'){
        smsData = req.query;
    }
    else if(req.method === 'POST'){
        smsData = req.body;
    }
    else{
        next('Method Not Allowed');
    }
    
    // Extract data from the request body
    const from = smsData.From;         // Phone number of the sender
    const body = smsData.Body;         // The SMS message
    
    const user = await users.getUserByPhone(from);
    if(!user){
      return next(`User with phone number ${from} not found.`);
    }
 
    // Parse the SMS message and get the response
    var response;
    try{
        response = await processCommand(user, body);
        logger.info(`Response: ${JSON.stringify(response)}`);
    }catch(error){
        logger.error(`Error parsing command for user ${user.id}: ${error}`);
        response.msg = error.message;
    }
    logger.info(`Res is: ${res} and the response message is: ${response.msg}`);
    sendSMSResponse(res, response.msg);
}

// Global error handler for SMS
// We should get here when a catastrophic error occurred
server.use((err, req, res, next) => {
    logger.error(err.stack);
    logger.error(err);
    sendSMSResponse(res, 'An error occurred while processing the request. Contact administrator.');
});