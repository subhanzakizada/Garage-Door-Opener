const express = require('express');
const server = express.Router();

module.exports = server;

const users = require('./user');
const { garageDoorSM } = require('./garageDoorControlSM');
const notifier = require('./notifier');

/*
    This endpoint is used by the controller to get the commands to execute: open a door, close it, etc.
    
*/
server.get('/controller/command/:controllerId', async (req, res, next) => {
    const door = await users.getDoorByControllerId(req.query.controllerId);
    if(!door){
        return res.status(404).send('Door not found');
    }
    res.json({ status: door.status });
});

server.post('/door', async (req, res, next) => {

    if(req.body.controllerId === undefined || req.body.status === undefined) return next('No controllerID or status');

    //Each door has a unique controller, identified with controllerId
    //The controllerId is part of the door object
    const door = await users.getDoorByControllerId(req.body.controllerId);
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