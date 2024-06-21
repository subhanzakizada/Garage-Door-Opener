require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { parseCommand } = require('./garageDoorControl'); 

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming POST data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint (testing to see if the server is up and running)
app.get('/', (req, res) => {
    res.send('Welcome to Garage Opener Project');
});

// Endpoint to handle incoming SMS messages from Twilio
app.post('/sms', smsHandler);
app.get('/sms', smsHandler);
    
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

    // Respond to Twilio to acknowledge receipt of the SMS and send the response back to the user
    res.send(`
        <Response>
            <Message>${responseMessage}</Message>
        </Response>
    `);
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});