const express = require('express');
const server = express.Router();

const sm = require('./garageDoorControlSM');
const users = require('./user');

module.exports = server;


server.get('/controller/command', (req, res) => {
    //Get commands for the controller to execute
    res.sendStatus(403);
});


/*
    {
        status: open_complete
        controller_id: id
    }
*/
server.put('/door', (req, res) => {
    const controller_id = req.body.controller_id;
    const status = req.body.status;
    
    const user = users.getUserByControllerId(controller_id);
    
    const nextState = await sm.processEvent(status, user.doors.find((d) => d.controller_id === controller_id).name, user);  
    //Uopdate user state
    
    res.send("Ok");
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
