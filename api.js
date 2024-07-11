const express = require('express');
const server = express.Router();

module.exports = server;

const users = require('./user');
const { garageDoorSM } = require('./garageDoorControlSM');
const notifier = require('./notifier');

/*
    This endpoint is used by the controller to get the commands to execute: open a door, close it, etc.
    
*/
server.get('/controller/command', (req, re, next) => {
    //Get commands for the controller to execute
    res.sendStatus(403);
});

server.post('/door', (req, res, next) => {

    if(req.body.controllerId === undefined || req.body.status === undefined) return next('No controllerID or status');

    const door = users.getDoorByControllerId(req.body.controllerId);
    if(!door){
        return res.status(404).send('Door not found');
    }
    try{
        const result = garageDoorSM.processEvent(req.body.status, door, notifier);
        //ToDO: if the state of the door changed, update the user
        // if(result.newStatus !== result.previousStatus){
        //     users.updateUser();
        //
        return res.send("OK");
    }catch(error){
        return next(error);
    }
});

//General handler
//ToDo: Log error
server.use((err, req, res, next) => {
    console.error(err);
    res.sendStatus(500);
});