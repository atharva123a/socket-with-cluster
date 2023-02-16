const socket = io();


socket.emit('connection', { username, room });

// the event "message" is being listened to here:
socket.on('message', (message) => {
    outputMessage(message);
    // scroll to bottom:
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

