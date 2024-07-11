const express = require('express');
const server = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

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
    if (!user) {
      return next(`User with phone number ${from} not found.`);
    }
 
    // Parse the SMS message and get the response
    var response = {};
    try{
        response = await parseCommand(user, body);
        console.log(response);
    }catch(error){
        //ToDo:Log the error
        response.msg = error.message;
    }
    
    sendSMSResponse(res, response.msg);
}

//Global error handler for SMS
// We should get here when a catastrophic error occurred
server.use((err, req, res, next) => {
    console.error(err.stack);
    sendSMSResponse(res, 'An error occurred while processing the request. Contact administrator.');
});