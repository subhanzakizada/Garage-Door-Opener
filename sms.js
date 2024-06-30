const express = require('express');
const server = express.Router();
const MessagingResponse = require('twilio').twiml.MessagingResponse;

module.exports = server;

const { parseCommand } = require('./garageDoorControl'); 

// Endpoint to handle incoming SMS messages from Twilio
server.post('/', smsHandler);
server.get('/', smsHandler);
    
async function smsHandler(req, res){
    
    var smsData;

    if(req.method === 'GET'){
        smsData = req.query;
    }
    else if(req.method === 'POST'){
        smsData = req.body;
    }
    else{
        res.status(405).send('Method Not Allowed');
        return;
    }
    
    // Extract data from the request body
    const from = smsData.From;         // Phone number of the sender
    const body = smsData.Body;         // The SMS message
    const city = smsData.FromCity;     // City of the sender
    const state = smsData.FromState;   // State of the sender
    const country = smsData.FromCountry; // Country of the sender
    const zip = smsData.FromZip;       // ZIP code of the sender

    console.log('Received SMS:');
    console.log(`From: ${from}`);
    console.log(`Message: ${body}`);
    console.log(`City: ${city}`);
    console.log(`State: ${state}`);
    console.log(`Country: ${country}`);
    console.log(`ZIP: ${zip}`);
 
    // Parse the SMS message and get the response
    const responseMessage = await parseCommand(body, from);

    // Generate TwiML response
    const twiml = new MessagingResponse();
    twiml.message(responseMessage);
    console.log('The message is ' + responseMessage);

    // Send TwiML response back to Twilio
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
}