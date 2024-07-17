const express = require('express');
const server = express.Router();
const logger = require('./logger');

module.exports = server;

const users = require('./user');
const { processEvent } = require('./garageDoorControlSM');
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
    const user = await users.getUserByControllerId(req.body.controllerId);
    if(!user){
        return res.status(404).send('User not found');
    }

    const door = user.doors.find((d) => d.controllerId === req.body.controllerId);

    if(!door){
        return res.status(404).send('Door not found');
    }

    try{
        const result = await processEvent(req.body.status, door, notifier);
        await users.updateUserDoorStatus(user, result);
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