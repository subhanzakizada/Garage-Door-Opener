require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const sms = require('./sms');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// I will change the username/password later and encapsulate it
const uri = "mongodb+srv://garage-door-opener:garage-door-opener-password@garage-door-opener.begcecd.mongodb.net/?retryWrites=true&w=majority&appName=Garage-Door-Opener"

// Connecting to MongoDB
async function connect() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB')
    } catch(error) {
        console.error(error);
    }
}

connect();


// Middleware to parse incoming POST data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint (testing to see if the server is up and running)
app.get('/', (req, res) => {
    res.send('Welcome to Garage Opener Project');
});

// App modules
app.use('/sms', sms);
//app.use('/api', api);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});