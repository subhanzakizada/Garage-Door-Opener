const express = require('express');
const server = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const logger = require('./logger');

module.exports = server;

const { parseCommand } = require('./garageDoorControl'); 
const users = require('./user');

function sendSMSResponse(res, msg){
    // Generate TwiML response
    const twiml = new MessagingResponse();
    twiml.message(msg);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
}

// Endpoint to handle incoming SMS messages from Twilio
server.post('/', smsHandler);
server.get('/', smsHandler);
    
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
    
    const user = await users.getUser(from);
    if(!user){
      return next(`User with phone number ${from} not found.`);
    }
 
    // Parse the SMS message and get the response
    var response = {};
    try{
        response = await parseCommand(user, body);
        users.updateUserDoorStatus(user, response);
        logger.info(`Response: ${JSON.stringify(response)}`);
    } catch(error){
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