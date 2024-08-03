const express = require('express');
const server = express.Router();
const logger = require('./logger');

module.exports = server;

const users = require('./user');
const { processEvent } = require('./garageDoorControlSM2');
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

//Get Door status in the server
server.get('/door/:controllerId', async (req, res, next) => {
    const door = req.user.doors.find((d) => d.controllerId === req.params.controllerId);
    if(!door){
        return res.status(404).send('Door not found');
    }
    res.json({ status: door.status });
});

//Notify any events happening in the controller associated with the door
server.put('/door/:controllerId', async (req, res, next) => {
    const door = req.user.doors.find((d) => d.controllerId === req.params.controllerId);
    if(!door){
        return res.status(404).send('Door not found');
    }

    try{
        const result = await processEvent(req.body.status, door, notifier);
        await users.updateUserDoorStatus(req.user, result);
        return res.send({
            status: result.newState,
            msg: result.msg
        });
    } catch(error) {
        return next(error);
    }
});

// /*
//     This endpoint is used by the controller to get the commands to execute: open a door, close it, etc.
//     if status is 'opening' or 'closing' it signals those operations need to start.
//     All other states are ignored.
// */
// server.get('/controller/command/:controllerId', async (req, res, next) => {
//     const door = req.user.doors.find((d) => d.controllerId === req.params.controllerId);
//     if(!door){
//         return res.status(404).send('Door not found');
//     }
//     res.json({ status: door.status });
// });

// // This endpoint is used by the controller to signal the door is open or closed
// // this happens only when initializing the door controller as a way of synching the state
// // of the controller with the server
// server.put('/door', async (req, res, next) => {
//     if(req.body.controllerId === undefined || req.body.status === undefined) return next('No controllerID or status');

//     const door = req.user.doors.find((d) => d.controllerId === req.body.controllerId);
//     if(!door){
//         return res.status(404).send('Door not found');
//     }

//     logger.info(`Updated state for door ${door.name}: ${req.body.status}`);

//     //if state == close || open = set the door to that state - al others ignore
//     const state = req.body.status;

//     //ToDo: This might be better handled with events (so notifications and all other logic is in one place)
//     if(state === 'open' || state === 'close'){
//         try{
//             const result = { newState: state, previousState: door.status, msg: `Set door ${door.name} to ${state}` };
//             await users.updateUserDoorStatus(req.user, result);
//             return res.json("OK");
//         } catch(error) {
//             return next(error);
//         }
//     }
//     return res.send("OK");
// });

// server.post('/door', async (req, res, next) => {

//     if(req.body.controllerId === undefined || req.body.status === undefined) return next('No controllerID or status');

//     const door = req.user.doors.find((d) => d.controllerId === req.body.controllerId);

//     if(!door){
//         return res.status(404).send('Door not found');
//     }

//     try{
//         const result = await processEvent(req.body.status, door, notifier);
//         await users.updateUserDoorStatus(req.user, result);
//         return res.send("OK");
//     } catch(error) {
//         return next(error);
//     }
// });

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