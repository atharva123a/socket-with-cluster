const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();

const server = http.createServer(app);

// creating our socket:
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatChord Bot';

// runs when client connects:
io.on('connection', (socket) => {
    // when user joins:
    console.log("User joined!")
});

const PORT = process.env.PORT || 5050;

server.listen(5050, () => {
    console.log(`Listening on port ${PORT}!`);
});
