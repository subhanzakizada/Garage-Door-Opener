const express = require('express');
const server = express.Router();

module.exports = server;

server.get('/door/status', (req, res) =>{
    ///
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
