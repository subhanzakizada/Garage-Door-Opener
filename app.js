const express = require('express');
const bodyParser = require('body-parser');
const { parseCommand } = require('./garageDoorControl'); 

const app = express();
const port = process.env.PORT;

// If something wrong with Heroku's server
if (!port) {
    console.error("Error: The PORT environment variable is not set. The server will only run on Heroku.");
    process.exit(1); // Exit the process with a failure code
}

// Middleware to parse incoming POST data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint (testing to see if the server is up and running)
app.get('/', (req, res) => {
    res.send('Hello, Hello, Hello!!!!!!!!!!!');
});

// Endpoint to handle incoming SMS messages from Twilio
app.post('/sms', (req, res) => {
    const smsData = req.body;

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

    // // Parse the SMS message and get the response
    // const responseMessage = parseCommand(body);

    // // Respond to Twilio to acknowledge receipt of the SMS and send the response back to the user
    // res.send(`
    //     <Response>
    //         <Message>${responseMessage}</Message>
    //     </Response>
    // `);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
