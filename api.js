const express = require('express');
const server = express.Router();
const logger = require('./logger');

module.exports = server;

const users = require('./user');
const { processEvent } = require('./garageDoorControlSM');
const notifier = require('./notifier');


async function userMiddleware(req, res, next){
    const apiKey = req.headers["authorization"];
    //console.log(`KEY: ${apiKey}`);
    const user = await users.getUserByKey(apiKey);
    if(!user) return res.sendStatus(401);
    req.user = user;
    next();
}

server.use(userMiddleware);

/*
    This endpoint is used by the controller to get the commands to execute: open a door, close it, etc.
    if status is 'opening' or 'closing' it signals those operations need to start.
    All other states are ignored.
*/
server.get('/controller/command/:controllerId', async (req, res, next) => {
    const door = req.user.doors.find((d) => d.controllerId === req.params.controllerId);
    if(!door){
        return res.status(404).send('Door not found');
    }
    res.json({ status: door.status });
});

server.post('/door', async (req, res, next) => {

    if(req.body.controllerId === undefined || req.body.status === undefined) return next('No controllerID or status');

    const door = req.user.doors.find((d) => d.controllerId === req.body.controllerId);

    if(!door){
        return res.status(404).send('Door not found');
    }

    try{
        const result = await processEvent(req.body.status, door, notifier);
        await users.updateUserDoorStatus(req.user, result);
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