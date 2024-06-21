require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const sms = require('./sms');
const api = require('./api');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming POST data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint (testing to see if the server is up and running)
app.get('/', (req, res) => {
    res.send('Welcome to Garage Opener Project');
});

// App modules
app.use('/sms', sms);
app.use('/api', api);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});