const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Store usernames and their corresponding socket IDs
const users = {};

// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a chat room with a username
  socket.on('join room', (data) => {
    const { room, username } = data;
    socket.join(room);
    console.log(`User ${username} joined room: ${room}`);

    // Store the username and socket ID
    users[socket.id] = username;

    // Emit an event to inform all clients about the updated user list
    io.to(room).emit('user list', Object.values(users));
  });

  // Handle chat messages
  socket.on('chat message', (data) => {
    console.log('Message:', data.message);

    // Include the username in the message data
    const username = users[socket.id];
    const messageData = {
      username,
      message: data.message,
    };

    // Broadcast the message to all clients in the same room
    io.to(data.room).emit('chat message', messageData);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');

    // Remove the user's username from the stored data
    delete users[socket.id];
  });
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});