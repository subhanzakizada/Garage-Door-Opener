const express = require('express');
const server = express.Router();

module.exports = server;

/*
    This endpoint is used by the controller to get the commands to execute: open a door, close it, etc.

*/
server.get('/controller/command', (req, res) => {
    //Get commands for the controller to execute
    res.sendStatus(403);
});

server.put('/door', (req, res) => {
    //Update status of a door
    res.sendStatus(403);
});

//Mock (not needed)
server.get('/door/status', (req, res) =>{
    res.json([
        {
            door: "left",
            status: "closed"
        },
        {
            door: "right",
            status: "open"
        }
        ]);
});
