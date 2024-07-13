const express = require('express');
const server = express.Router();
const logger = require('./logger');

module.exports = server;

const users = require('./user');
const { garageDoorSM } = require('./garageDoorControlSM');
const notifier = require('./notifier');

/*
    This endpoint is used by the controller to get the commands to execute: open a door, close it, etc.
    
*/
server.get('/controller/command/:controllerId', async (req, res, next) => {
    const door = await users.getDoorByControllerId(req.params.controllerId);
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
        const previousStatus = door.status; // Store the previous status of the door
        const result = await garageDoorSM.processEvent(req.body.status, door, notifier);
        
        // If the state of the door changed, update the user's door status
        if(result.status !== previousStatus) {
            await users.updateUser(door.userPhone, door.name, result.newState);
        }

        return res.send("OK");
    } catch(error) {
        return next(error);
    }
});

//General handler
server.use((err, req, res, next) => {
    res.sendStatus(500);

    const errorDetails = {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        timestamp: new Date().toISOString(),
    };

    logger.error(errorDetails);
});